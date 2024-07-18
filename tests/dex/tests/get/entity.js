import {loadDefaultOptions, loadEnvironmentConfig} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import EntityConfig from '../../../../helpers/dynamicEntity/entityConfig.js';

export const options = loadDefaultOptions()

let entitiesConfiguration = new EntityConfig(JSON.parse(open('../data/dex.json')))
let metrics = new Metrics(entitiesConfiguration.getEntityAliases().map((alias) => {
    return {
        key: alias,
        types: ['trend', 'rate', 'counter'],
        isTime: {
            trend: true,
            counter: false
        },
        thresholds: {
            trend: ['p(95)<=200'],
            rate: ['rate==1']
        }
    }
}))

options.scenarios = {
    EntityGetVUS: {
        exec: 'entityDataGet',
        executor: 'shared-iterations',
        tags: {
            testId: 'EntityDataGet',
            testGroup: 'DataExchange',
        },
        iterations: 50,
        vus: 5
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
const limit = 100

export function entityDataGet() {
    entitiesConfiguration.getEntityAliases().map((alias) => {
        const requestHandler = new Handler(http, urlHelper, bapiHelper)
        let result = requestHandler.getDataFromTable(`${alias}?page[offset]=0&page[limit]=${limit}`)
        metrics.add(alias, requestHandler.getLastResponse(), 200)
        assertionHelper.assertLessOrEqual(result.length, limit)
    })
}