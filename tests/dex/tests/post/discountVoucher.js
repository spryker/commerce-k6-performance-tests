import {loadDefaultOptions, loadEnvironmentConfig, randomString} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';

export const options = loadDefaultOptions();

const metricKeys = {
    discountVouchersCreateKey: 'discount-voucher-create',
};

let metrics = new Metrics([{
    key: metricKeys.discountVouchersCreateKey,
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
    DiscountVouchersCreateVUS: {
        exec: 'creatDiscountVouchersEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'creatDiscountVouchers',
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

/**
 * 
 * @param {number} quantity 
 * @returns 
 */
function generateVouchers(quantity = 3) {
    return new Array(quantity).fill(undefined).map(() => {
        return {
            'code': faker.string.letterN(10),
            'is_active': true,
            'max_number_of_uses': 1,
            'number_of_uses': 0,
            'voucher_batch': 0
        }
    });
}

export function creatDiscountVouchersEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper); 

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        const voucherName = faker.beer.beerName() + ' ' + randomString(6);
        return {
            'is_active': true,
            'name': voucherName,
            'vouchers': generateVouchers(faker.number.number(5, 20)),
            'discounts': [
                {
                    'fk_discount_voucher_pool': null,
                    'fk_store': null,
                    'amount': 0,
                    'calculator_plugin': 'PLUGIN_CALCULATOR_FIXED',
                    'collector_query_string': 'sku = \'*\'',
                    'decision_rule_query_string': '',
                    'description': 'Some discount ' + voucherName,
                    'discount_key': null,
                    'discount_type': 'voucher',
                    'display_name': voucherName,
                    'is_active': true,
                    'is_exclusive': false,
                    'minimum_item_amount': 1,
                    'priority': 9999,
                    'valid_from': '2024-06-20 00:00:00',
                    'valid_to': '2024-10-20 00:00:00',
                    'stores': [
                        {
                            'fk_store': 1
                        },
                        {
                            'fk_store': 2
                        }
                    ],
                    'amounts': [
                        {
                            'fk_currency': 61,
                            'gross_amount': faker.number.number(100, 10000),
                            'net_amount': null
                        },
                        {
                            'fk_currency': 93,
                            'gross_amount':  faker.number.number(500, 30000),
                            'net_amount': null
                        }
                    ]
                }
            ]
        }
    });

    let response = requestHandler.createEntities('discount-voucher-pools', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add(metricKeys.discountVouchersCreateKey, requestHandler.getLastResponse(), 201);
}