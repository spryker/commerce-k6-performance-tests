import {loadDefaultOptions, loadEnvironmentConfig, uuid} from '../../../../lib/utils.js';
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
    customerAddressCreateKey: 'customer-address-create',
    customersPreloadKey: 'customer-address-customers-preload',
    countryPreloadKey: 'customer-address-country-preload'
}

let metrics = new Metrics([{
    key: metricKeys.customerAddressCreateKey,
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
}, {
    key: metricKeys.countryPreloadKey,
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
    CustomerAddressCreateVUS: {
        exec: 'createCustomerAddressEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'createCustomerAddress',
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
let countryId = null;
let customersData = null;

/**
 * @param {string} code 
 * @returns number
 */
function getCountryId(code = null) {
    if (countryId) {
        return countryId;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`countries?filter[country.iso2_code]=${code}`);

    countryId = response[0].id_country;

    metrics.add(metricKeys.countryPreloadKey, requestHandler.getLastResponse(), 200);

    return countryId;
}

function customersPreload() {
    if (customersData) {
        return;
    }

    const limit = 200;
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`customers?page[limit]=${limit}`);

    customersData = response;

    metrics.add(metricKeys.customersPreloadKey, requestHandler.getLastResponse(), 200);
}

function getRandomCustomer() {
    customersPreload();

    return customersData[Math.floor(Math.random() * customersData.length)];
}

export function createCustomerAddressEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const countryId = getCountryId('DE'); 
    const customerId = getRandomCustomer().id_customer;

    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            fk_country: countryId,
            fk_customer: customerId,
            fk_region: null,
            address1: faker.address.street(),
            address2: faker.address.street(),
            city: faker.address.city(),
            zip_code: faker.address.zip(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            uuid: uuid()
        }
    })

    let response = requestHandler.createEntities('customer-addresses', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }

    metrics.add(metricKeys.customerAddressCreateKey, requestHandler.getLastResponse(), 201);
}