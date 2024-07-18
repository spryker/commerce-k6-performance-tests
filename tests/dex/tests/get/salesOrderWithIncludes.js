import AdminHelper from '../../../../helpers/admin-helper.js';
import { AssertionsHelper } from '../../../../helpers/assertions-helper.js';
import { BapiHelper } from '../../../../helpers/bapi-helper.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import { UrlHelper } from '../../../../helpers/url-helper.js';
import { Http } from '../../../../lib/http.js';
import { loadDefaultOptions, loadEnvironmentConfig } from '../../../../lib/utils.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';

export const options = loadDefaultOptions();

const metricKeys = {
    salesOrderWithIncludesGetKey: 'sales-order-with-includes-get'
};

let metrics = new Metrics([{
    key: metricKeys.salesOrderWithIncludesGetKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(90)<200'],
        rate: ['rate==1']
    }
}, ]);

options.scenarios = {
    SalesOrdersGetVUS: {
        exec: 'getSalesOrders',
        executor: 'shared-iterations',
        tags: {
            testId: 'GetSalesOrders',
            testGroup: 'DataExchange',
        },
        iterations: 100,
        vus: 5,
    },

};

const targetEnv = __ENV.DATA_EXCHANGE_ENV

const http = new Http(targetEnv)
const envConfig = loadEnvironmentConfig(targetEnv)
const urlHelper = new UrlHelper(envConfig)
const adminHelper = new AdminHelper()
const assertionHelper = new AssertionsHelper()
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper)
const requestHandler = new Handler(http, urlHelper, bapiHelper);
const limit = 50
const includes = [
    'salesOrderBillingAddresses',
    'salesOrderComments',
    'salesOrderInvoices',
    'salesOrderNotes',
    'salesOrderTotals',
    'salesOrderPayments',
    'salesOrderItems.salesOrderConfiguredBundleItems',
    'salesOrderItems.salesOrderItemConfigurations',
    'salesOrderItems.salesOrderItemGiftCards',
    'salesOrderItems.salesOrderItemMetadatas',
    'salesOrderItems.salesOrderItemOptions',
    'salesOrderItems.salesOrderItemServicePoints',
    'salesOrderItems.salesOmsOrderItemStates',
    'salesOrderItems.salesOmsOrderItemStatesHistories',
    'salesOrderRefunds'
];

export function getSalesOrders() {
    let include = `include=${includes.join(',')}`;
    let pageLimit = `page[limit]=${limit}`;
    let url = 'sales-orders?' + include + '&' + pageLimit;
    console.warn(url);
    const response = requestHandler.getDataFromTable('sales-orders?' + include + '&' + pageLimit);

    if (response.status > 300) {
        console.error(response.body)
    }

    assertionHelper.assertLessOrEqual(response.length, limit);
    metrics.add(metricKeys.salesOrderWithIncludesGetKey, requestHandler.getLastResponse(), 200);
}
