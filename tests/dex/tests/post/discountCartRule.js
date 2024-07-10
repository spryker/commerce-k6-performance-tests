import {loadDefaultOptions, loadEnvironmentConfig, randomString, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';

export const options = loadDefaultOptions();

let metrics = new Metrics([{
    key: 'discount-cart-rule-create',
    types: ['trend', 'rate'],
    isTime: {
        trend: true,
        counter: false
    },
    thresholds: {
        trend: ['p(95)<200'],
        rate: ['rate==1']
    }
}, ])

options.scenarios = {
    DiscountCartRuleCreateVUS: {
        exec: 'creatDiscountCartRuleEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'creatDiscountCartRule',
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
const currencyCodes = [];

/**
 * @param {string} email 
 * @returns number
 */
function getCurrencyId(curencyCode) {

    if (currencyCodes[curencyCode]) {
        return currencyCodes[curencyCode];
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`currencies?filter[currency.code]=${curencyCode}`);

    currencyCodes[curencyCode] = response[0].id_currency;

    return currencyCodes[curencyCode];
}

export function creatDiscountCartRuleEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper); 

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        const discountName = faker.beer.beerName() + ' ' + faker.number.number(0, 1000) + randomString(5);
        const discountDescription = faker.beer.beerAlcohol() + ' ' + faker.beer.beerStyle();

        return {
            'fk_discount_voucher_pool': null,
            'fk_store': null,
            'amount': 0,
            'calculator_plugin': 'PLUGIN_CALCULATOR_PERCENTAGE',
            'collector_query_string': 'sku = \'*\'',
            'decision_rule_query_string': 'sub-total >= \'10\'',
            'description': discountDescription,
            'discount_key': null,
            'discount_type': 'voucher',
            'display_name': discountName,
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
                    'fk_currency': getCurrencyId('EUR'),
                    'gross_amount': faker.number.number(10, 1000),
                    'net_amount': null
                },
                {
                    'fk_currency': getCurrencyId('CHF'),
                    'gross_amount':  faker.number.number(500, 3000),
                    'net_amount': null
                }
            ],
            'promotions': [
                {
                    'abstract_sku': '123',
                    'abstract_skus': '123, 124',
                    'quantity': 1,
                    'uuid': uuid()
                }
            ]
        };
    });

    let response = requestHandler.createEntities('discounts', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add('discount-cart-rule-create', requestHandler.getLastResponse(), 201);
}