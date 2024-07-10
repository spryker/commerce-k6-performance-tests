import {loadDefaultOptions, loadEnvironmentConfig, randomString, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';

export const options = loadDefaultOptions();

let metrics = new Metrics([{
    key: 'sales-return-create',
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<200'],
        rate: ['rate==1']
    }
}, ]);

options.scenarios = {
    SalesReturnCreateVUS: {
        exec: 'createSalesReturnEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'createSalesReturn',
            testGroup: 'DataExchange',
        },
        iterations: 1,
        vus: 1
    }
}

options.thresholds = metrics.getThresholds(); 
const payloadSize = 1;
const targetEnv = __ENV.DATA_EXCHANGE_ENV;
const http = new Http(targetEnv);
const envConfig = loadEnvironmentConfig(targetEnv);
const urlHelper = new UrlHelper(envConfig);
const adminHelper = new AdminHelper();
const assertionHelper = new AssertionsHelper();
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper);
const defaultCustomerId = 10;
const limit = 100;
const storeCode = 'DE';
const returnReason = 'Damaged';
let salesOrdersData = null;

/**
 * @returns string
 */
function getnerateReturnReference() {
    return `customer--${defaultCustomerId}-R${randomString()}`;
}

/**
 * @returns undefined
 */
function salesOrdersPreload() {
    if (salesOrdersData) {
        return;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable('sales-orders?include=salesOrderItems&page[limit]=${limit}');

    if (response.status !== 200) {
        console.error(response.body);
    }

    salesOrdersData = response;
}

function getRandomSalesOrderWithItems() {
    salesOrdersPreload();

    return salesOrdersData[Math.floor(Math.random() * salesOrdersData.length)];
}

export function createSalesReturnEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper); 
    let salesOrderData = getRandomSalesOrderWithItems();
    let customerReference = salesOrderData.customer_reference;
    let orderItemId = salesOrderData.salesOrderItems[0].id_sales_order_item;

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            customerReference: customerReference,
            merchantReference: null, 
            returnReference:getnerateReturnReference(),
            store: storeCode,
            returnItems: [
                {
                    fk_sales_order_item: orderItemId,
                    reason: returnReason,
                    uuid: uuid()
                }
            ]
        }
    });

    let response = requestHandler.createEntities('sales-returns', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add('sales-returns-create', requestHandler.getLastResponse(), 201);
}