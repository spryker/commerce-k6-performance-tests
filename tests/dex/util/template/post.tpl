import {loadDefaultOptions, loadEnvironmentConfig, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import faker from 'k6/x/faker';

export const options = loadDefaultOptions()

let metrics = new Metrics([
    {
        key: 'TABLE_ALIAS-create',
        types: ['trend', 'rate'],
        isTime: {
            trend: true,
            counter: false
        },
        thresholds: {
            trend: ['p(95)<200'],
            rate: ['rate==1']
        }
    },
])

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

    CREATE_LOGIC
}