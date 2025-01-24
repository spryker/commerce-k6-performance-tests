import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials,
    loadDefaultOptions
} from '../../../../lib/utils.js';
import BrowserHandler from '../../../../helpers/browser/browser.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import BackOffice from '../../../../helpers/browser/backOffice.js';
import {handleSummary} from '../../../../lib/summary.js';
import Visit from '../../../../helpers/browser/action/visit.js';
import Fill from "../../../../helpers/browser/action/fill.js";
import Click from "../../../../helpers/browser/action/click.js";
import ValidateTextExists from "../../../../helpers/browser/action/validateTextExists.js";
import ScrollDown from "../../../../helpers/browser/action/scrollDown.js";
import Clear from "../../../../helpers/browser/action/clear.js";

let timeout = Math.ceil(15000)
let visitList = [
    new Visit('sales-order-threshold-gui/global'),
    // new ResetForm('[name="global-threshold"]'),
    new Clear('[id="global-threshold_hardThreshold_threshold"]'),
    // new Clear('[name="global-threshold[hardThreshold][threshold]"]'),
    new Clear('[id="global-threshold_hardMaximumThreshold_threshold"]'),
    // new Fill('[name="global-threshold[hardMaximumThreshold][threshold]"]', '', { force: true }),
    new Clear('[id="global-threshold_softThreshold_threshold"]'),
    // new Fill('[name="global-threshold[softThreshold][threshold]"]', '', { force: true }),
    // new Click('[for="global-threshold_softThreshold_strategy_placeholder"]', {}),
    new ScrollDown(),
    new Click('[class="btn btn-primary safe-submit"]', {waitForNavigation: true, timeout: timeout}),
    new ValidateTextExists('.alert__text', 'The Global Thresholds is saved successfully.')
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

let configurationArray = [
    ['BACKOFFICE_RESET_THRESHOLD', {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '10m',
        exec: 'resetThreshold',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()
options.discardResponseBodies = true

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);

export { handleSummary }

export async function resetThreshold() {
    try {
        let page = await browser.newPage({ timeout: 30000 })

        await page.setDefaultTimeout(timeout)
        await page.setDefaultNavigationTimeout(30000)

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
