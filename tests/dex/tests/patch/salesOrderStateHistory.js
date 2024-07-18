import {loadDefaultOptions, loadEnvironmentConfig} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';

export const options = loadDefaultOptions();

const metricKeys = {
    salesOrderItemStateUpdateKey: 'sales-order-item-state-update',
    salesOrderItemStatePreloadKey: 'sales-order-item-state-preload'
};

let metrics = new Metrics([{
    key: metricKeys.salesOrderItemStatePreloadKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<500'],
        rate: ['rate==1']
    }
}, {
    key: metricKeys.salesOrderItemStateUpdateKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<500'],
        rate: ['rate==1']
    }
}, ])

options.scenarios = {
    SalesOrderCreateVUS: {
        exec: 'updateSalesOrderItems',
        executor: 'shared-iterations',
        tags: {
            testId: 'updateSalesOrderItems',
            testGroup: 'DataExchange',
        },
        iterations: 250,
        vus: 5
    }
}

options.thresholds = metrics.getThresholds();
const payloadSize = 300;
const targetEnv = __ENV.DATA_EXCHANGE_ENV;
const http = new Http(targetEnv);
const envConfig = loadEnvironmentConfig(targetEnv);
const urlHelper = new UrlHelper(envConfig);
const adminHelper = new AdminHelper();
const assertionHelper = new AssertionsHelper();
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper);
let salesOrdersData = null;

/**
 * @returns undefined
 */
function salesOrdersPreload() {
    if (salesOrdersData) {
        return;
    }
    const limit = 100;
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    salesOrdersData = requestHandler.getDataFromTable(`sales-orders?include=salesOrderItems&page[limit]=${limit}`);

    metrics.add(metricKeys.salesOrderItemStatePreloadKey, requestHandler.getLastResponse(), 200);
}

/**
 * Returns sales orders with items
 * 
 * @returns object
 */
function getRandomSalesOrderWithItems() {
    salesOrdersPreload();

    return salesOrdersData[Math.floor(Math.random() * salesOrdersData.length)];
}

function getRandomSalesOrderItem() {
    let orderData = getRandomSalesOrderWithItems();

    return orderData.salesOrderItems[Math.floor(Math.random() * orderData.salesOrderItems.length)];
}

export function updateSalesOrderItems() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper); 
    let salesOrderItem = getRandomSalesOrderItem(); 
    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            id_sales_order_item: salesOrderItem.id_sales_order_item,
            fk_oms_order_item_state: salesOrderItem.fk_oms_order_item_state,
        };
    });

    let response = requestHandler.updateEntities('sales-order-items', JSON.stringify({
        data: payload
    }))

    if (response.status !== 200) {
        console.error(response.body)
    }

    metrics.add(metricKeys.salesOrderItemStateUpdateKey, requestHandler.getLastResponse(), 200);
}