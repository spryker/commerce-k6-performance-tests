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
    customersPreloadKey: 'sales-order-customers-preload'
};

let metrics = new Metrics([{
    key: metricKeys.salesOrderCreateKey,
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<200'],
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
        trend: ['p(99)<200'],
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
        trend: ['p(99)<200'],
        rate: ['rate==1']
    }
},])

options.scenarios = {
    SalesOrderCreateVUS: {
        exec: 'creatSalesOrderEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'creatSalesOrder',
            testGroup: 'DataExchange',
        },
        iterations: 500,
        vus: 5
    }
}

options.thresholds = metrics.getThresholds();
const payloadSize = 100;
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

function generateInvoiceId() {
    return `Invoice-${randomString(5)}`
}

function generateOrderReference() {
    return `LOAD1--${randomString(5)}`
}

function skuGenerator() {
    return `SKU-${randomString(5)}`
}
function localesPreload() {
    if (localesData) {
        return;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable('locales');

    localesData = response;

    metrics.add(metricKeys.localesPreloadKey, requestHandler.getLastResponse(), 200);
}

function customersPreload() {
    if (customersData) {
        return;
    }

    const limit = 100;
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`customers?page[limit]=${limit}`);

    customersData = response;

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

function generateSalesOmsOrderItemStatesHistories(maxState) {

    let states = [];

    for (let i = 1; i <= maxState; i++) {
        states.push({
            'fk_oms_order_item_state': i,
            'created_at':'2022-02-24 00:00:00.000000'
        });
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
            'uuid': uuid(),
            'salesOmsOrderItemStatesHistories': generateSalesOmsOrderItemStatesHistories(maxOrderItemState),
            'salesOrderItemMetadatas': [
                generateSalesOrderItemMetadata()
            ],
            'salesOrderItemOptions': generateSalesOrderItemOptions(faker.number.intRange(1, 10), sku)
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
        console.error(response.body)
    }

    return JSON.parse(response.body).data;
}

function getRandomBuinessAddressId(addresses) {
    return addresses[Math.floor(Math.random() * addresses.length)].id_sales_order_address;
}

export function creatSalesOrderEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    let maxOrderItemState = faker.number.intRange(1, 16);
    let buisnessAddresses = preCreateSalesOrederBusinessAddress();
    let customerData = getRandomCustomer();

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        let orderObject = {
            'fk_locale': getLocaleId(defalutLocale),
            'fk_order_source': null,
            'fk_sales_order_address_billing': getRandomBuinessAddressId(buisnessAddresses),
            'fk_sales_order_address_shipping': getRandomBuinessAddressId(buisnessAddresses),
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

            'salesOrderComments': generateSalesOrderComments(faker.number.intRange(1, 20)),
            'salesOrderTotals': generateSalesOrderTotals(faker.number.intRange(1, 5)),
            'salesOrderItems': generateSalesOrderItems(faker.number.intRange(1, 5), maxOrderItemState),
            'salesOrderPayments': [
                generateSalesOrderPyment()
            ]
        };
 
        if (maxOrderItemState === 15) {
            orderObject['salesOrderRefunds'] = generateSalesOrderRefunds();
        }

        return orderObject;
    });

    let response = requestHandler.createEntities('sales-orders', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add(metricKeys.salesOrderCreateKey, requestHandler.getLastResponse(), 201);
}