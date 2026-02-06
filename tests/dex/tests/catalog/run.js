import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials,
    loadDefaultOptions,
    sortRandom
} from '../../../../lib/utils.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import Yves from "../../../../helpers/browser/yves.js";
import Visit from "../../../../helpers/browser/action/visit.js";
import VisitAndSave from "../../../../helpers/browser/action/visitAndSave.js";
import BrowserHandler from "../../../../helpers/browser/browser.js";

const maxCartSize= Number(__ENV.MAX_CART_SIZE)
const randomiseCartSize= Boolean(__ENV.RANDOM_CART_SIZE_WITHIN_TARGET_MAX)
let amountOfIterations = 100
let amountOfVirtualUsers = 1
let timeout = Math.ceil(60000 * amountOfVirtualUsers)

let metricsConfig = [
    'home_page',
    'catalog_page',
    'product_page',
    'cart_page'
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

const metrics = new Metrics(metricsConfig);

export const options = loadDefaultOptions();

let configurationArray = [
    [`YVES_BROWSING`, {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        exec: 'executeYvesActions',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'S9',
            testGroup: 'YvesBrowsing',
        },
        iterations: amountOfIterations,
        vus: amountOfVirtualUsers,
        maxDuration: '1200m',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);

export async function executeYvesActions() {
    let visitList = [
        new Visit('/DE/en/cameras-&-camcorders/digital-cameras'),
        new Visit('/DE/en/smart-wearables'),
        new Visit('/DE/en/samsung-galaxy-gear-110'),
        new VisitAndSave('/DE/en/samsung-galaxy-gear-110', '[data-qa="add-to-cart-button"]'),
        new VisitAndSave('/DE/en-us/canon-ixus-175-5', '[data-qa="add-to-cart-button"]')
    ]
    const context = await browser.newContext();
    const page = await context.newPage({ timeout: 6000 });

    try {
        await page.setDefaultTimeout(timeout * 10)
        let checkout = new Yves(
            new BrowserHandler(
                page,
                new BasicAuth(basicAuth.username, basicAuth.password),
                metrics,
                checkoutScenario.getStorefrontBaseUrl(),
                targetEnv,
                Boolean(parseInt(__ENV.SCREENSHOT_ACTIVE)),
                Boolean(parseInt(__ENV.VALIDATE_VISITED_URL))
            ),
            metrics,
            timeout,
        );

        await checkout.browse(sortRandom(visitList));
    } catch (e) {
        console.log('Failed to execute executeYvesActions', e.message)
    } finally {
        page.close()
    }
}
