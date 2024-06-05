import {loadDefaultOptions, loadEnvironmentConfig, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
        
export const options = loadDefaultOptions()

let metrics = new Metrics([{
    key: 'products-create',
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
        iterations: 50,
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

export function createEntity() {
    const requestHandler = new Handler(http, urlHelper, bapiHelper)

    let payload = new Array(100).fill(undefined).map(() => {
        return {
            fk_product_abstract: 1,
            attributes: '{}',
            discount: 0,
            is_active: false,
            is_quantity_splittable: false,
            sku: uuid(),
            warehouses: null
        }
    })

    let response = requestHandler.createEntities('products', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }
    metrics.add('products-create', requestHandler.getLastResponse(), 201)

}