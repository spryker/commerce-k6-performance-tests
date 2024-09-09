import { loadDefaultOptions, loadEnvironmentConfig, randomString, randomHex, uuid } from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import { Http } from '../../../../lib/http.js';
import { UrlHelper } from '../../../../helpers/url-helper.js';
import { BapiHelper } from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import { AssertionsHelper } from '../../../../helpers/assertions-helper.js';
import { Metrics } from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';

export const options = loadDefaultOptions();

const metricKeys = {
    salesOrderCreateKey: 'sales-order-create',
    localesPreloadKey: 'sales-order-locales-preload',
    customersPreloadKey: 'sales-order-customers-preload',
    preCreateSalesOrderPaymentMethodTypesKey: 'sales-order-payment-method-types-precreate',
    preCreateSalesOrderOmsOrderItemStatesKey: 'sales-order-oms-order-item-states-precreate'
};

const omsOrderItemStates = [
    'new',
    'warehouse allocated',
    'payment pending',
    'paid',
    'commission calculated',
    'tax pending',
    'tax invoice submitted',
    'product review requested',
    'confirmed', 
    'invoice generated',
    'waiting',
    'exported',
    'shipped',
    'delivered',
    'closed',
    'gift card shipped',
    'gift card purchased',
    'waiting for return',
    'returned',
    'return canceled'
];

let metrics = new Metrics([{
    key: metricKeys.salesOrderCreateKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<500'],
        rate: ['rate==1']
    }
},{
    key: metricKeys.localesPreloadKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(99)<500'],
        rate: ['rate==1']
    }
},{
    key: metricKeys.customersPreloadKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(99)<500'],
        rate: ['rate==1']
    }
},{
    key: metricKeys.preCreateSalesOrderPaymentMethodTypesKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(99)<500'],
        rate: ['rate==1']
    }
},
])

options.scenarios = {
    Initialisation: {
        exec: 'initialiseEnv',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'InitialiseEnvForSalesOrderCreation',
            testGroup: 'DataExchange',
        },
        iterations: 1,
        vus: 1
    },
    SalesOrderCreateVUS: {
        exec: 'creatSalesOrderEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'creatSalesOrder',
            testGroup: 'DataExchange',
        },
        iterations: 10000,
        vus: 6,
        startTime: '10s',
        maxDuration: '1200m'
    }
}

options.thresholds = metrics.getThresholds();
const payloadSize = 40;
const targetEnv = __ENV.DATA_EXCHANGE_ENV;
const http = new Http(targetEnv);
const envConfig = loadEnvironmentConfig(targetEnv);
const urlHelper = new UrlHelper(envConfig);
const adminHelper = new AdminHelper();
const assertionHelper = new AssertionsHelper();
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper);
const defalutLocale = 'en_US';
const defaultCurrency = 'EUR';
const defaultStore = 'DE';

let localesData = null;
let customersData = null;
let omsOrderStatesData = null;

function generateInvoiceId() {
    return `Invoice-${randomString(16)}`
}

function generateOrderReference() {
    return `LOAD${randomString(3)}--${randomString(16)}`
}

function skuGenerator() {
    return `SKU-${randomString(5)}`
}
function localesPreload() {
    if (localesData) {
        return;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    localesData =requestHandler.getDataFromTable('locales');

    metrics.add(metricKeys.localesPreloadKey, requestHandler.getLastResponse(), 200);
}

function customersPreload() {
    if (customersData) {
        return;
    }

    const limit = 100;
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    customersData = requestHandler.getDataFromTable(`customers?page[limit]=${limit}`);

    metrics.add(metricKeys.customersPreloadKey, requestHandler.getLastResponse(), 200);
}

function getLocaleId(localeCode = null) {
    localesPreload()

    if (localeCode === null) {
        return localesData.find(locale => locale.code === localeCode).id_locale;
    }

    return localesData[Math.floor(Math.random() * localesData.length)].id_locale;
}

function getRandomCustomer() {
    customersPreload();

    return customersData[Math.floor(Math.random() * customersData.length)];
}

function loadOmsOrderItemStates() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    omsOrderStatesData = requestHandler.getDataFromTable('oms-order-item-states');
}

function generateSalesOrederInvoice() {
    return {
        'reference': generateInvoiceId(),
        'issue_date': '2024-07-04 10:02:28.000000',
        'template_path': 'SalesInvoice/invoice/invoice.twig',
        'email_sent': true
    }
}

function generateSalesOrderComment() {
    return {
        'message': faker.zen.loremIpsumSentence(5),
        'username': 'Admin Spryker',
        'uuid': uuid()
    }
}

function generateSalesOrderComments(commentsCount = 1) {
    return new Array(commentsCount).fill(undefined).map(() => {
        return generateSalesOrderComment();
    })
}

function generateSalesOrderTotals(count = 3) {
    return new Array(count).fill(undefined).map(() => {
        return {
            'canceled_total': faker.number.intRange(0, 1000),
            'discount_total': faker.number.intRange(0, 1000),
            'grand_total': faker.number.intRange(0, 1000),
            'order_expense_total': faker.number.intRange(0, 1000),
            'refund_total': faker.number.intRange(0, 1000),
            'subtotal': faker.number.intRange(0, 1000),
            'tax_total': faker.number.intRange(0, 1000),
            'uuid': uuid()
        }
    })
}

function generateSalesOmsOrderItemStatesHistories(maxStateId) {
    let states = [];

    for (let stateId = 1; stateId <= maxStateId; stateId++) {
        if (omsOrderStatesData.find(stateEntity => stateEntity.id_oms_order_item_state === stateId)) {
            states.push({
                'fk_oms_order_item_state': stateId,
                'created_at':'2022-02-24 00:00:00.000000'
            });
        }
    }

    return states;
}

function generateSalesOrderItemMetadata() {
    return {
        'image': 'https://images.icecat.biz/img/gallery_mediums/17360369_3328.jpg',
        'super_attributes': '{"color":"Silver"}',
        'uuid': uuid()
    }
}

function generateSalesOrderItemOptions(optionsCount =1, sku = null) {
    return new Array(optionsCount).fill(undefined).map(() => {
        return {
            'sku': sku,
            'gross_price': faker.number.intRange(1000, 100000),
            'group_name': 'Color',
            'tax_rate': 19,
            'value': 'Silver'
        }
    })
}

function generateSalesOrderPyment() {
    return {
        'fk_sales_payment_method_type': 1,
        'amount': faker.number.intRange(1000, 10000)
    }
}

function generateSalesOrderItems(countItems = 1, maxOrderItemState = 14) {
    const groupKeyGenerator = (sku) => {
        return `${sku}_${randomHex(32)}`;
    }

    const taxRate = 19;
    let sku = skuGenerator();

    return new Array(countItems).fill(undefined).map(() => {
        return {
            'fk_oms_order_item_state': maxOrderItemState,
            'fk_oms_order_process': 1, // default value
            'fk_sales_order_item_bundle': null,
            'fk_sales_shipment': null,
            'amount': null,
            'amount_base_measurement_unit_name': null,
            'amount_measurement_unit_code': null,
            'amount_measurement_unit_conversion': null,
            'amount_measurement_unit_name': null,
            'amount_measurement_unit_precision': null,
            'amount_sku': null,
            'canceled_amount': 0,
            'cart_note': null,
            'discount_amount_aggregation': faker.number.intRange(100, 10000),
            'discount_amount_full_aggregation': faker.number.intRange(100, 10000),
            'expense_price_aggregation': faker.number.intRange(100, 10000),
            'gross_price': faker.number.intRange(1000, 100000),
            'group_key': groupKeyGenerator(sku),
            'is_quantity_splittable': true,
            'last_state_change': '2024-07-09 10:13:03.000000',
            'merchant_reference':  randomString(8),
            'name': faker.product.productName(),
            'net_price': 0,
            'order_item_reference': randomHex(32),
            'price': faker.number.intRange(1000, 100000),
            'price_to_pay_aggregation': faker.number.intRange(1000, 100000),
            'product_offer_reference': null,
            'product_option_price_aggregation': 0,
            'quantity': faker.number.intRange(1, 4),
            'quantity_base_measurement_unit_name': null,
            'quantity_measurement_unit_code': null,
            'quantity_measurement_unit_conversion': null,
            'quantity_measurement_unit_name': null,
            'quantity_measurement_unit_precision': null,
            'refundable_amount': faker.number.intRange(1000, 100000),
            'remuneration_amount': null,
            'sku': sku,
            'subtotal_aggregation': faker.number.intRange(1000, 100000),
            'tax_amount': faker.number.intRange(1000, 100000),
            'tax_amount_after_cancellation': null,
            'tax_amount_full_aggregation': faker.number.intRange(1000, 100000),
            'tax_rate': taxRate, 
            'tax_rate_average_aggregation': taxRate, 
            'uuid': uuid() ,
            'salesOmsOrderItemStatesHistories': generateSalesOmsOrderItemStatesHistories(maxOrderItemState),
            'salesOrderItemMetadatas': [
                generateSalesOrderItemMetadata()
            ],
            'salesOrderItemOptions': generateSalesOrderItemOptions(faker.number.intRange(1, 3), sku)
        };
    });
}

function generateSalesOrderRefunds() {
    return {
        'amount': faker.number.intRange(1000, 10000),
        'comment': null,
    }
}

function preCreateSalesOrederBusinessAddress() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let payloadShippingAddresses = new Array(payloadSize * 2).fill(undefined).map(() => {
        return {
            'fk_country': 60,
            'fk_region': null,
            'address1': faker.address.streetName(),
            'address2': faker.address.streetName(),
            'address3': null,
            'cell_phone': null,
            'city': faker.address.city(),
            'comment': null,
            'company': 'Home Production',
            'description': null,
            'email': faker.person.email(),
            'first_name': faker.person.firstName(),
            'last_name': faker.person.lastName(),
            'middle_name': null,
            'phone': faker.person.phone(),
            'po_box': null,
            'salutation': 'Mr',
            'zip_code': faker.address.zip(),
            'uuid': uuid()
        };
    });

    let response = requestHandler.createEntities('sales-order-addresses', JSON.stringify({
        data: payloadShippingAddresses
    }))

    if (response.status !== 201) {
        console.error('preCreateSalesOrederBusinessAddress', response.body)
    }

    return JSON.parse(response.body).data;
}

function getRandomBusinessAddressId(addresses) {
    return addresses[Math.floor(Math.random() * addresses.length)].id_sales_order_address;
}

function preCreateSalesPaymentMethodTypesIfNotExist() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let response = requestHandler.getDataFromTable('sales-payment-method-types');

    if (response.length > 0) {
        return response;
    }

    response = requestHandler.createEntities('sales-payment-method-types', JSON.stringify({
        data: [
            {
                'payment_method': 'invoice',
                'payment_provider': 'DummyPayment'
            }
        ]
    }))

    if (response.status !== 201) {
        console.error('preCreateSalesPaymentMethodTypesIfNotExist', response.body)
    }

    metrics.add(metricKeys.preCreateSalesOrderPaymentMethodTypesKey, requestHandler.getLastResponse(), 200);
}

function preCreateOmsOrderItemStatesIfNotExist() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let omsOrderStatesData = requestHandler.getDataFromTable('oms-order-item-states');
    let missedStates = omsOrderItemStates.filter(state => !omsOrderStatesData.find(stateEntity => stateEntity.name === state));

    if (missedStates.length === 0) {
        return;
    }

    let payload = missedStates.map(state => {
        return {
            name: state
        }
    });

    let response = requestHandler.createEntities('oms-order-item-states', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error('preCreateOmsOrderItemStatesIfNotExist', response.body)
    }

    metrics.add(metricKeys.preCreateSalesOrderOmsOrderItemStatesKey, requestHandler.getLastResponse(), 200);
}

function preCreateOmsOrderProcessIfNotExist() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let response = requestHandler.getDataFromTable('oms-order-processes');

    if (response.length > 0) {
        return;
    }

    response = requestHandler.createEntities('oms-order-processes', JSON.stringify({ data: [{'name': 'DummyPayment01'}] }));

    if (response.status !== 201) {
        console.error('preCreateOmsOrderProcessIfNotExist', response.body)
    }
}

function getRandomOrderItemStateId() {
    let setateIds = omsOrderStatesData.map(state => state.id_oms_order_item_state);

    return setateIds[Math.floor(Math.random() * setateIds.length)];
}

export function initialiseEnv() {
    preCreateOmsOrderProcessIfNotExist();
    preCreateSalesPaymentMethodTypesIfNotExist();
    preCreateOmsOrderItemStatesIfNotExist();
}

export function creatSalesOrderEntity() {
    loadOmsOrderItemStates();

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let buisnessAddresses = preCreateSalesOrederBusinessAddress();
    let customerData = getRandomCustomer();
    let maxOrderItemState = getRandomOrderItemStateId(); 

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            'fk_locale': getLocaleId(defalutLocale),
            'fk_order_source': null,
            'fk_sales_order_address_billing': getRandomBusinessAddressId(buisnessAddresses),
            'fk_sales_order_address_shipping': getRandomBusinessAddressId(buisnessAddresses),
            'cart_note': null,
            'company_business_unit_uuid': null,
            'company_uuid': null,
            'currency_iso_code': defaultCurrency,
            'customer_reference': customerData.customer_reference,
            'email': customerData.email,
            'first_name': customerData.first_name,
            'is_test': false,
            'last_name': customerData.last_name,
            'oms_processor_identifier': 1,
            'order_custom_reference': null,
            'order_reference': generateOrderReference(),
            'price_mode': 'GROSS_MODE',
            'salutation': 'Mr',
            'store':defaultStore,
            'uuid': uuid(),
            'salesOrderInvoices': [
                generateSalesOrederInvoice()
            ],
            'salesOrderComments': generateSalesOrderComments(faker.number.intRange(1, 10)),
            'salesOrderTotals': generateSalesOrderTotals(faker.number.intRange(1, 5)),
            'salesOrderItems': generateSalesOrderItems(faker.number.intRange(1, 2), maxOrderItemState),
            'salesOrderPayments': [
                generateSalesOrderPyment()
            ],
            'salesOrderRefunds':  generateSalesOrderRefunds(),
        };
    });

    let response = requestHandler.createEntities('sales-orders', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error('sales-orders-error:', response.status);
        // console.error(JSON.stringify({
        //     data: payload
        // }));
        // console.error('creatSalesOrderEntity', response.body)
    }

    metrics.add(metricKeys.salesOrderCreateKey, requestHandler.getLastResponse(), 201);
}