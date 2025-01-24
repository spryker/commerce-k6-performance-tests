import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials, getSeries, getThread,
    loadDefaultOptions, sortRandom,
} from '../../../../lib/utils.js';
import BrowserHandler from '../../../../helpers/browser/browser.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import BackOffice from '../../../../helpers/browser/backOffice.js';
import {handleSummary} from '../../../../lib/summary.js';
import VisitAndSave from '../../../../helpers/browser/action/visitAndSave.js';
import Visit from '../../../../helpers/browser/action/visit.js';


let timeout = Math.ceil(60000)
let visitList = [
    // new Visit('product-management'),
    new VisitAndSave('product-management/edit?id-product-abstract=TARGET_ID'),
    // new VisitAndSave('product-management/edit'),
]

let metricsConfig = [
    'security-gui/login',
    ...visitList
].map((code) => {
    return {
        key: `${typeof code === 'string' ? code : code.locator}`,
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
//
// AMOUNT_OF_RAMP_VUS=30
// RAMP_STAGE_DURATION=10

let configurationArray = [
    ['BACKOFFICE_PRODUCT_MANAGEMENT_LIST', {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        executor: 'ramping-vus',
        startvus: 1,
        stages: getSeries(Number(__ENV.AMOUNT_OF_RAMP_VUS), Number(__ENV.RAMP_STAGE_DURATION), 10),
        gracefulRampDown: '10m',
        exec: 'browseBackOffice',
        tags: {
            testId: 'BackOfficeOnePageLoad',
            testGroup: 'BackOffice',
        },
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()
options.discardResponseBodies = true

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);

export { handleSummary }

export async function browseBackOffice() {
    try {
        let page = await browser.newPage({ timeout: 60000 })

        await page.setDefaultTimeout(timeout * 10)
        await page.setDefaultNavigationTimeout(60000)

        try {
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
    } catch (e) {

    }
}
