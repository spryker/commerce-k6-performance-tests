import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials,
    getStoreWhiteList,
    loadDefaultOptions,
    loadEnvironmentConfig,
    sortRandom
} from '../../../../lib/utils.js';
import Checkout from '../../../../helpers/browser/checkout.js';
import Browser from '../../../../helpers/browser/browser.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import ConfigHandler from '../../../../helpers/dynamicEntity/handler/configHandler.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import file from 'k6/x/file';
import read from 'k6/x/read';
import fail from 'k6';
import {handleSummary} from '../../../../lib/summary.js';

const maxCartSize= Number(__ENV.MAX_CART_SIZE)
const randomiseCartSize= Boolean(__ENV.RANDOM_CART_SIZE_WITHIN_TARGET_MAX)
let amountOfIterations = Number(__ENV.AMOUNT_OF_CHECKOUT_ITERATIONS)
let amountOfVirtualUsers = Number(__ENV.AMOUNT_OF_CHECKOUT_VUS)

let timeout = Math.ceil(6000 * amountOfVirtualUsers)

let metricsConfig = [
    'home_page',
    'catalog_page',
    'product_page',
    'cart_page',
    'checkout_page',
    'shipping_address',
    'shipping_method',
    'summary_page',
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
    ['Product_List_Generation', {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '1200m',
        exec: 'generateProductList',
    }],
    [`CHECKOUT_RANDOM_1_TO_${maxCartSize}_ITEMS`, {
        options: {
            browser: {
                type: 'chromium',
            },
        },
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
        startTime: '15s',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()
options.discardResponseBodies = true

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);

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
        handler.getDataFromTableWithPagination('products?include=productStocks,productAbstractUrls', 500, (product) => product.productStocks.filter((stock) => stock.is_never_out_of_stock).length, 100)
            .map((product) => {
                return product.productAbstractUrls && product.productAbstractUrls.filter((url) => storeInfo.fk_locale === url.fk_locale && !url.url.includes('gift-card'))
            })
            .map((urls) => {
                if (Array.isArray(urls)) {
                    products.push(...urls.map((url) => url.url))
                }
            })

        file.writeString(PRODUCTS_LIST_FILE, JSON.stringify(products));
    } else {
        file.writeString(PRODUCTS_LIST_FILE, JSON.stringify([
            '/en/canon-ixus-285-8',
            '/en/canon-ixus-165-13',
            '/en/canon-ixus-177-14',
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

    try {
        let page = await browser.newPage({ timeout: 30000 })
        await page.setDefaultTimeout(timeout)
        await page.setDefaultNavigationTimeout(30000)

        try {
            let locale = storeConfig.getStoreDefaultLocaleUrlAlias(__ENV.STORE)
            let checkout = new Checkout(
                new Browser(
                    page,
                    new BasicAuth(basicAuth.username, basicAuth.password),
                    metrics,
                    checkoutScenario.getStorefrontBaseUrl(),
                    targetEnv,
                    Boolean(parseInt(__ENV.SCREENSHOT_ACTIVE)),
                    Boolean(parseInt(__ENV.VALIDATE_VISITED_URL))
                ),
                new BasicAuth(basicAuth.username, basicAuth.password),
                metrics,
                locale,
                randomiseCartSize ? Math.floor(Math.random() * maxCartSize) + 1 : maxCartSize,
                timeout,
                Boolean(parseInt(__ENV.USE_EXISTING_CUSTOMER_ACCOUNTS))
            );

            // await checkout.placeGuestOrder('dummyMarketplacePaymentInvoice', sortRandom(products));
            await checkout.placeGuestOrder('dummyMarketplacePaymentInvoice', products);
            // await checkout.placeGuestOrder('dummyPaymentInvoice', sortRandom(products));
        } catch (e) {
            console.error('Failed to execute executeCheckoutScenario:', e)
        } finally {
            page.close()
        }
    } catch (e) {
        console.error('Failed to execute executeCheckoutScenario:', e)
    }
}