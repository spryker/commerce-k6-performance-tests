import {
    getBasicAuthCredentials,
    getStoreWhiteList,
    loadDefaultOptions,
    loadEnvironmentConfig,
    sortRandom
} from '../../../../../lib/utils.js';
import {AssertionsHelper} from '../../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../../helpers/browser/metrics.js';
import {Http} from '../../../../../lib/http.js';
import {UrlHelper} from '../../../../../helpers/url-helper.js';
import AdminHelper from '../../../../../helpers/admin-helper.js';
import {BapiHelper} from '../../../../../helpers/bapi-helper.js';
import ConfigHandler from '../../../../../helpers/dynamicEntity/handler/configHandler.js';
import Handler from '../../../../../helpers/dynamicEntity/handler.js';
import file from 'k6/x/file';
import read from 'k6/x/read';
import fail from 'k6';
import {handleSummary} from '../../../../../lib/summary.js';
import Customer from "../../../../../helpers/api/customer.js";
import Api from "../../../../../helpers/api/api.js";
import {
    SharedMultiCheckoutScenario
} from "../../../../cross-product/sapi/scenarios/checkout/shared-multicheckout-scenario.js";

const maxCartSize= Number(__ENV.MAX_CART_SIZE)
const randomiseCartSize= Boolean(__ENV.RANDOM_CART_SIZE_WITHIN_TARGET_MAX)
let amountOfIterations = Number(__ENV.AMOUNT_OF_CHECKOUT_ITERATIONS)
let amountOfVirtualUsers = Number(__ENV.AMOUNT_OF_CHECKOUT_VUS)

const checkoutScenario = new SharedMultiCheckoutScenario(__ENV.DATA_EXCHANGE_ENV);

let metricsConfig = [
    'success_page',
].map((code) => {
    return {
        key: `${code}_loading_time`,
        isTime: {
            trend: true,
            counter: false
        },
        types: ['trend', 'rate', 'counter'],
        thresholds: {
            trend: ['p(95)<1000'],
            rate: ['rate==1'],
        },
    };
})

let orderSuccessMetrics = Array.from(
    { length: maxCartSize },
    (_, i) => {
        return {
            key: `orders_placed_with_${i + 1}_unique_items`,
            isTime: {
                trend: false,
                counter: false
            },
            thresholds: {
                rate: ['rate==1'],
            },
            types: ['counter', 'rate']
        }
    }
)

let orderFailedMetrics = Array.from(
    { length: maxCartSize },
    (_, i) => {
        return {
            key: `orders_failed_with_${i + 1}_unique_items`,
            isTime: {
                trend: false,
                counter: false
            },
            thresholds: {
                rate: ['rate===0'],
            },
            types: ['counter', 'rate']
        }
    }
)

metricsConfig.push(...orderSuccessMetrics, ...orderFailedMetrics)

const metrics = new Metrics(metricsConfig);

export const options = loadDefaultOptions();

let configurationArray = [
    // ['Product_List_Generation', {
    //     executor: 'per-vu-iterations',
    //     vus: 1,
    //     iterations: 1,
    //     maxDuration: '1200m',
    //     exec: 'generateProductList',
    // }],
    [`CHECKOUT_RANDOM_1_TO_${maxCartSize}_ITEMS`, {
        exec: 'executeCheckoutScenario',
        executor: 'per-vu-iterations',
        env: {
            numberOfItems: `${maxCartSize}`
        },
        tags: {
            testId: 'S5',
            testGroup: 'Checkout',
        },
        iterations: amountOfIterations,
        vus: amountOfVirtualUsers,
        maxDuration: '1200m',
        startTime: '1s',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()
options.discardResponseBodies = true

const targetEnv = __ENV.DATA_EXCHANGE_ENV

let http = new Http(targetEnv);
let targetEnvConfig = loadEnvironmentConfig(targetEnv);
let urlHelper = new UrlHelper(targetEnvConfig);
let adminHelper = new AdminHelper();
let assertionsHelper = new AssertionsHelper();
let bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionsHelper);
let handler = new Handler(http, urlHelper, bapiHelper, getStoreWhiteList())
let storeConfig = new ConfigHandler(http, urlHelper, bapiHelper, getStoreWhiteList())

const PRODUCTS_LIST_FILE = 'tests/dex/tests/data/products.json'

export async function generateProductList() {
    let storeInfo = storeConfig.getStoreConfig(__ENV.STORE)
    let products = []
    if (!parseInt(__ENV.USE_PREDEFINED_PRODUCTS)) {
        handler.getDataFromTableWithPagination(
            'products?include=productStocks,productAbstractUrls',
            500,
            (product) => product.productStocks.filter((stock) => stock.is_never_out_of_stock).length, 100
        )
            .map((product) => {
                let urls = product.productAbstractUrls && product.productAbstractUrls.filter((url) => storeInfo.fk_locale === url.fk_locale && !url.url.includes('gift-card'))
                return {
                    sku: product.sku,
                    urls: urls
                }

            })
            .map((config) => {
                if (Array.isArray(config.urls) && config.urls.length) {
                    let url = config.urls.map((url) => url.url).shift()
                    products.push({
                        sku: config.sku,
                        url: `${url}`.replace('/en-us/', '/en/')
                    })
                }
            })

        file.writeString(PRODUCTS_LIST_FILE, JSON.stringify(products));
    } else {
        file.writeString(PRODUCTS_LIST_FILE, JSON.stringify([
            {
                sku: '008_30692992',
                url: '/en/canon-ixus-285-8'
            },
            {
                sku: '013_25904584',
                url: '/en/canon-ixus-165-13'
            },
            {
                sku: '015_25904009',
                url: '/en/canon-ixus-177-15'
            }
        ]));
    }
}

export { handleSummary }

export async function executeCheckoutScenario() {
    let products = JSON.parse(read.readFile(PRODUCTS_LIST_FILE).content)
    if (!products.length) {
        console.error('No products retrieved from instance!!!')
        fail('No products retrieved from instance!!!')
    }

    // try {
        checkoutScenario.execute(sortRandom(products), randomiseCartSize ? Math.floor(Math.random() * maxCartSize) + 1 : maxCartSize)
    // } catch (e) {
    //     console.error('Failed to execute executeCheckoutScenario:', e)
    // } finally {
    // }
}
