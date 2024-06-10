import {loadDefaultOptions, loadEnvironmentConfig} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
        
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
        iterations: 1,
        vus: 1
    }
}

options.thresholds = metrics.getThresholds()

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const http = new Http(targetEnv)
const envConfig = loadEnvironmentConfig(targetEnv)
const urlHelper = new UrlHelper(envConfig)
const adminHelper = new AdminHelper()
const assertionHelper = new AssertionsHelper()
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper)

export function createEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper)
    let payload = new Array(1).fill(undefined).map(() => {
        return {
            is_active: true,
            fk_company: 1,
            fk_company_business_unit: 1,
            fk_customer: 1,
            is_default: false,
            key: ''
        }
    })

    let response = requestHandler.createEntities('company-users', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }
    metrics.add('company-users-create', requestHandler.getLastResponse(), 201)

}
