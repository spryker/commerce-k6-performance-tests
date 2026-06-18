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
import {handleSummary} from '../../../../lib/summary.js';

const maxCartSize= Number(__ENV.MAX_CART_SIZE)
const randomiseCartSize= Boolean(__ENV.RANDOM_CART_SIZE_WITHIN_TARGET_MAX)
let amountOfIterations = 10
let amountOfVirtualUsers = 20
let timeout = Math.ceil(60000 * 20)

let visitList = [
    new Visit('/DE/en/search?q=canon'),
    new Visit('/DE/en/acer-aspire-s7-134'),
    new Visit('/DE/en/search?q=sony'),
    new Visit('/DE/en/asus-zenpad-z380c-1b-163'),
    new Visit('/DE/en/sony-nex-vg20eh-201'),
    new Visit('/DE/en/samsung-galaxy-s5-mini-66'),
    new Visit('/DE/en/search?q=acer'),
    new Visit('/DE/en/sony-hdr-mv1-198'),
    new Visit('/DE/en/search?q=samsung'),
    new Visit('/DE/en/sony-xperia-z3-80'),
    new Visit('/DE/en/search?q=samsung Galaxy'),
    new Visit('/DE/en/canon-powershot-g9-x-30'),
    new Visit('/DE/en/samsung-galaxy-s5-mini-66'),
    new Visit('/DE/en/sony-smartwatch-3-92'),
    new Visit('DE/en/hp-elite-x2-1012-g1-167'),
]

let metricsConfig = [
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
        gracefulStop: '30s',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

options.thresholds = metrics.getThresholds()

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);
export { handleSummary }

export async function executeYvesActions() {
    const context = await browser.newContext();
    const page = await context.newPage({ timeout: 600000 });

    try {
        await page.setDefaultTimeout(timeout)
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
            false
        );

        await checkout.browse(sortRandom(visitList));
    } catch (e) {
        console.log('Failed to execute executeYvesActions', e?.message ?? String(e))
    } finally {
        await page.close()
        await context.close()
    }
}
