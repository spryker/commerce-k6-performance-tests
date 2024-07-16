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
    salesOrderItemStateCreateKey: 'sales-order-item-state-create',
    salesOrdersPreloadKey: 'sales-order-item-state-sales-order-preload'
};

let metrics = new Metrics([{
    key: metricKeys.salesOrderItemStateCreateKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<200'],
        rate: ['rate==1']
    }
}, {
    key: metricKeys.salesOrdersPreloadKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<200'],
        rate: ['rate==1']
    }
},])

options.scenarios = {
    SalesOrderCreateVUS: {
        exec: 'creatSalesOrderItemHistory',
        executor: 'shared-iterations',
        tags: {
            testId: 'creatSalesOrder',
            testGroup: 'DataExchange',
        },
        iterations: 250,
        vus: 5
    }
}

options.thresholds = metrics.getThresholds();
const payloadSize = 200;
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
    const response = requestHandler.getDataFromTable(`sales-orders?include=salesOrderItems&page[limit]=${limit}`);

    salesOrdersData = response;

    metrics.add(metricKeys.salesOrdersPreloadKey, requestHandler.getLastResponse(), 200);
}

function getRandomSalesOrderWithItems() {
    salesOrdersPreload();

    return salesOrdersData[Math.floor(Math.random() * salesOrdersData.length)];
}

function getRandomSalesOrderItem() {
    let orderData = getRandomSalesOrderWithItems();

    return orderData.salesOrderItems[Math.floor(Math.random() * orderData.salesOrderItems.length)];
}

function generateRandomPastDate() {
    let date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 1000));
    return date.toISOString().split('T')[0] + ' 00:00:00.000000';
}

export function creatSalesOrderItemHistory() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper); 
    let salesOrderItem = getRandomSalesOrderItem(); 
    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            fk_sales_order_item: salesOrderItem.id_sales_order_item,
            fk_oms_order_item_state: salesOrderItem.fk_oms_order_item_state,
            created_at: generateRandomPastDate()
        }
    });

    let response = requestHandler.createEntities('oms-order-item-state-histories', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add(metricKeys.salesOrderItemStateCreateKey, requestHandler.getLastResponse(), 200);
}