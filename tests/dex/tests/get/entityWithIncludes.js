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

let metrics = new Metrics(entitiesConfiguration.getEntitiesWithIncludes().map((alias) => {
    return {
        key: alias,
        types: ['trend', 'rate', 'counter'],
        isTime: {
            trend: true,
            counter: false
        },
        thresholds: {
            trend: ['p(95)<=100'],
            rate: ['rate==1']
        }
    }
}))

options.scenarios = {
    EntityGetWithIncludesVUS: {
        exec: 'entityDataGet',
        executor: 'shared-iterations',
        tags: {
            testId: 'EntityDataGetWithIncludes',
            testGroup: 'DataExchange',
        },
        iterations: 10,
        vus: 10
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
    entitiesConfiguration.getEntityAliases().map((entityAlias) => {
        const requestHandler = new Handler(http, urlHelper, bapiHelper)
        let includes = entitiesConfiguration.getIncludeAliasesByEntityAlias(entityAlias)
        if (includes.length) {
            let include = `include=${includes.join(',')}&`
            let result = requestHandler.getDataFromTable(`${entityAlias}?${include}page[offset]=0&page[limit]=${limit}`)
            metrics.add(entityAlias, requestHandler.getLastResponse(), 200)
            assertionHelper.assertLessOrEqual(result.length, limit)

            if (requestHandler.getLastResponse().status !== 200) {
                console.error(requestHandler.getLastResponse().body, requestHandler.getLastResponse().url)
            }
        }
    })
}