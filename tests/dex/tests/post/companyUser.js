import {loadDefaultOptions, loadEnvironmentConfig, uuid, randomString} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';

export const options = loadDefaultOptions()

let metrics = new Metrics([{
    key: 'company-users-create',
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
    EntityCreateVUS: {
        exec: 'createEntity',
        executor: 'shared-iterations',
        tags: {
            testId: 'CreateEntity',
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
let companyBusinessUnitId = null;
let companyId = null;
let companyRoleId = null;

/**
 * @param {string} key 
 * @returns undefined
 */
function dataCompanyBusinessUnitPreload(key = null) {

    if(companyBusinessUnitId) {
        return;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`company-business-units?filter[company-business-unit.key]=${key}`);

    companyBusinessUnitId = response[0].id_country;
    companyId = response[0].fk_company;
}

/**
 * @param {string} code 
 * @returns number
 */
function dataCompanyRolesPreload(key = null) {

    if(companyRoleId) {
        return;
    }

    const requestHandler = new Handler(http, urlHelper, bapiHelper);
    const response = requestHandler.getDataFromTable(`company-roles?filter[company-role.key]=${key}`);

    companyRoleId = response[0].id_company_role;
}

/**
 * @returns string
 */
function generateCustomerReference() {
    return `${(randomString(3))}-${(randomString(5))}`;
}

/**
 * @returns string
 */
function generateCustomerEmail() {
    return faker.person.email();
}

export function createEntity() {
    dataCompanyBusinessUnitPreload('test-business-unit-1');
    dataCompanyRolesPreload('Spryker_Buyer');

    const requestHandler = new Handler(http, urlHelper, bapiHelper)
    let payload = new Array(payloadSize).fill(undefined).map(() => {
        return {
            'fk_locale': null,
            'fk_user': null,
            'company': null,
            'anonymized_at': null,
            'customer_reference': generateCustomerReference(),
            'date_of_birth': null,
            'email': generateCustomerEmail(),
            'first_name': faker.person.firstName(),
            'last_name': faker.person.lastName(),
            'companyUsers': [
                {
                    'is_active': true,
                    'fk_company': companyId,
                    'fk_company_business_unit': companyBusinessUnitId,
                    'is_default': false,
                    'key': randomString(),
                    'uuid': uuid(),
                    'roles': [
                        {
                            'fk_company_role' : companyRoleId
                        }
                    ]
                }
            ]
        
        }
    })

    let response = requestHandler.createEntities('customers', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }
    metrics.add('company-users-create', requestHandler.getLastResponse(), 201);
}