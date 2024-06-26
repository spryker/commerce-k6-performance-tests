import {loadDefaultOptions, loadEnvironmentConfig, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';
import CustomerHelper from '../../../../helpers/customer-helper.js';

export const options = loadDefaultOptions();

let metrics = new Metrics([{
    key: 'customer-address-create',
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
const customerHelper = new CustomerHelper();
let countryId = null;
let customerId = null;

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

    return countryId;
}

/**
 * @param {string} email 
 * @returns number
 */
function getCustomerId(email) {

    if (customerId) {
        return customerId;
    }
    
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`customers?filter[customer.email]=${email}`);

    customerId = response[0].id_customer;

    return customerId;
}

export function createCustomerAddressEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const countryId = getCountryId('DE'); 
    const customerId = getCustomerId(customerHelper.getDefaultCustomerEmail());

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

    metrics.add('customer-addresses-create', requestHandler.getLastResponse(), 201);
}