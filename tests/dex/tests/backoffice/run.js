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

let amountOfIterations = 1
let amountOfVirtualUsers = 1
let timeout = Math.ceil(60000 * amountOfVirtualUsers)
let visitList = [
    'dashboard',
    'sales/matrix',
    'sales',
    'merchant-sales-order-merchant-user-gui',
    'merchant-sales-return-merchant-user-gui',
    'sales-reclamation-gui',
    'sales-return-gui',
    'refund/table',
    'gift-card-balance',
    'customer',
    'customer/edit?id-customer=1', //save
    'customer-group',
    'customer-access-gui', //save
    'company-gui/list-company',
    'company-gui/edit-company/index?id-company=12', //save
    'company-gui/list-company',
    'company-business-unit-gui/list-company-business-unit',
    'company-business-unit-gui/edit-company-business-unit?id-company-business-unit=1', //save
    'company-unit-address-gui/list-company-unit-address',
    'company-unit-address-gui/edit-company-unit-address?id-company-unit-address=17', //save
    'company-user-gui/list-company-user',
    'company-user-gui/edit-company-user?id-company-user=1', // save
    'company-role-gui/list-company-role',
    'company-role-gui/edit-company-role?id-company-role=1', //save
    'product-management',
    'product-management/edit?id-product-abstract=224', //save
    'product-management/edit?id-product-abstract=223', //save
    'product-management/edit?id-product-abstract=222', //save
    'product-management/edit?id-product-abstract=221', //save
    'product-management/edit?id-product-abstract=220', //save
    'category-gui/list',
    'category-gui/edit?id-category=15', //save
    'product-attribute-gui/attribute',
    'product-attribute-gui/attribute/edit?id=1', //save
    'product-attribute-gui/attribute',
    'availability-gui',

]

let metricsConfig = [
    'security-gui/login',
    // ...visitList
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
    ['BACKOFFICE_ACTIVITY', {
        options: {
            browser: {
                type: 'chromium',
            },
        },
        exec: 'browseBackOffice',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'B1',
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
    console.log(basicAuth)
    try {
        await page.setDefaultTimeout(timeout * 10)

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
