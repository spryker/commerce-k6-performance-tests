import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials,
    loadDefaultOptions,
} from '../../../../lib/utils.js';
import BrowserHandler from '../../../../helpers/browser/browser.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import BackOffice from '../../../../helpers/browser/backOffice.js';

let amountOfIterations = 30
let amountOfVirtualUsers = 5
let timeout = Math.ceil(60000)
let visitList = [
    // 'sales/matrix',
    'order-matrix-gui/matrix'
]

let metricsConfig = [
    'security-gui/login',
    ...visitList
].map((code) => {
    return {
        key: `${code}`,
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
options.discardResponseBodies = true

let configurationArray = [
    ['BACKOFFICE_ORDER_MATRIX', {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        exec: 'browseBackOffice',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'BackOfficeOrderMatrix',
            testGroup: 'BackOffice',
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

export async function browseBackOffice() {
    let page = await browser.newPage()
    try {
        await page.setDefaultTimeout(timeout)

        let backoffice = new BackOffice(
            new BrowserHandler(
                page,
                new BasicAuth(basicAuth.username, basicAuth.password),
                metrics,
                checkoutScenario.getBackofficeBaseUrl(),
                targetEnv,
                Boolean(parseInt(__ENV.SCREENSHOT_ACTIVE)),
                Boolean(parseInt(__ENV.VALIDATE_VISITED_URL))
            ),
            metrics,
            timeout,
        )
        await backoffice.browse(visitList)

    } catch (e) {
        console.error('Failed to execute browseBackOffice', e.message)
    } finally {
        page.close()
    }
}
