import { browser } from 'k6/browser';
import { SharedCheckoutScenario } from '../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {
    getBasicAuthCredentials,
    loadDefaultOptions, sortRandom,
} from '../../../../lib/utils.js';
import BrowserHandler from '../../../../helpers/browser/browser.js';
import BasicAuth from '../../../../helpers/basicAuth.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
import BackOffice from '../../../../helpers/browser/backOffice.js';
import VisitAndSave from '../../../../helpers/browser/action/visitAndSave.js';
import Visit from '../../../../helpers/browser/action/visit.js';
import {handleSummary} from '../../../../lib/summary.js';

let amountOfIterations = Number(__ENV.AMOUNT_OF_BACKOFFICE_ITERATIONS)
let amountOfVirtualUsers = Number(__ENV.AMOUNT_OF_BACKOFFICE_VUS)
let timeout = Math.ceil(10000)
let visitList = [
    new Visit('dashboard'),
    new Visit('sales/matrix'),
    new Visit('sales'),
    new Visit('merchant-sales-order-merchant-user-gui'),
    new Visit('merchant-sales-return-merchant-user-gui'),
    new Visit('sales-reclamation-gui'),
    new Visit('sales-return-gui'),
    new Visit('refund/table'),
    new Visit('gift-card-balance'),
    new Visit('customer'),
    new VisitAndSave('customer/edit?id-customer=1'),
    new Visit('customer-group'),
    new VisitAndSave('customer-access-gui'),
    new Visit('company-gui/list-company'),
    new VisitAndSave('company-gui/edit-company/index?id-company=12'),
    new Visit('company-gui/list-company'),
    new Visit('company-business-unit-gui/list-company-business-unit'),
    new VisitAndSave('company-business-unit-gui/edit-company-business-unit?id-company-business-unit=1'),
    new Visit('company-unit-address-gui/list-company-unit-address'),
    new VisitAndSave('company-unit-address-gui/edit-company-unit-address?id-company-unit-address=17'),
    new Visit('company-user-gui/list-company-user'),
    new VisitAndSave('company-user-gui/edit-company-user?id-company-user=1'),
    new Visit('company-role-gui/list-company-role'),
    new VisitAndSave('company-role-gui/edit-company-role?id-company-role=1'),
    new Visit('product-management'),
    new VisitAndSave('product-management/edit?id-product-abstract=TARGET_ID'),
    new Visit('product-management'),
    new VisitAndSave('product-management/edit?id-product-abstract=TARGET_ID'),
    new Visit('company-role-gui/list-company-role'),
    // new VisitAndSave('product-management/edit?id-product-abstract=222'),
    // new VisitAndSave('product-management/edit?id-product-abstract=221'),
    // new VisitAndSave('product-management/edit?id-product-abstract=220'),
    new Visit('category-gui/list'),
    // new VisitAndSave('category-gui/edit?id-category=15'),
    new Visit('product-attribute-gui/attribute'),
    new VisitAndSave('product-attribute-gui/attribute/edit?id=1'),
    new Visit('product-attribute-gui/attribute'),
    new Visit('availability-gui'),
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
    ['BACKOFFICE_ACTIVITY', {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        exec: 'browseBackOffice',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'BackOfficeRandomLoad',
            testGroup: 'BackOffice',
        },
        iterations: amountOfIterations,
        vus: amountOfVirtualUsers,
        maxDuration: '60m',
        gracefulStop: '10m',
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
    let page = await browser.newPage({ timeout: 60000 })

    await page.setDefaultTimeout(timeout * 10)
    await page.setDefaultNavigationTimeout(60000)
    console.log(basicAuth.username, basicAuth.password)
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
        await backoffice.browse(sortRandom(visitList))
    } catch (e) {
        console.error('Failed to execute browseBackOffice', e.message)
    } finally {
        page.close()
    }
}
