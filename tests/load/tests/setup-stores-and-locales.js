import {browser} from 'k6/experimental/browser';
import {SharedCheckoutScenario} from '../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import {getBasicAuthCredentials, loadDefaultOptions} from '../../../lib/utils.js';
import {Browser} from '../../../helpers/browser/browser.js';
import BasicAuth from '../../../helpers/basicAuth.js';
import {Metrics} from '../../../helpers/browser/metrics.js';
import BackOffice from "../../../helpers/browser/backOffice.js";
import ConfigGenerator from "../../../helpers/store/configGenerator.js";
import file from 'k6/x/file';
import read from 'k6/x/read';
import exec from 'k6/execution';

let metricsConfig = [
    'store-gui-create',
    'security-gui-login',
    'store-gui-list-table',
].map((code) => {
    return {
        key: `${code}_loading_time`,
        isTime: true,
        types: ['trend', 'rate'],
        thresholds: {
            trend: ['p(95)<1000'],
            rate: ['rate==1'],
        },
    };
})

metricsConfig.push({
    key: 'orders_created_counter',
    types: ['counter'],
    isTime: false,
    thresholds: {}
})

const metrics = new Metrics(metricsConfig);
const targetAmountOfStores = Number(__ENV.DMS_AMOUNT_OF_STORES)
const limitPerIteration = 5
const targetAmountOfUsers = Math.ceil(targetAmountOfStores / limitPerIteration)
export const options = loadDefaultOptions();
let configurationArray = [
    ['DMS_STORE_GENERATE_CONFIGURATION', {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '5m',
        exec: 'generateConfiguration',
    }]
]

for (let i = 1; i <= targetAmountOfUsers; i++) {
    configurationArray.push([`DMS_${i}_STORE_SETUP`, {
        options: {
            browser: {
                type: 'chromium',
            }
        },
        exec: 'executeStoresSetup',
        executor: 'per-vu-iterations',
        tags: {
            testId: `DMS-${i}`,
            testGroup: 'Admin Area',
            userId: `${i}`
        },
        iterations: 1,
        vus: 1,
        maxDuration: '1200m',
        startTime: `${(i - 1) * 240}s`
    }])
}

options.scenarios = Object.fromEntries(configurationArray)
options.thresholds = metrics.getThresholds()

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const checkoutScenario = new SharedCheckoutScenario(targetEnv);
const basicAuth = getBasicAuthCredentials(targetEnv);

const STORE_CONFIGURATION_FILE = 'tests/load/tests/data/stores.json'

export function generateConfiguration() {
    let stores = new ConfigGenerator().generate(targetAmountOfStores)
    file.writeString(STORE_CONFIGURATION_FILE, JSON.stringify(stores));
}

export async function executeStoresSetup() {
    let page = browser.newPage()
    page.setDefaultTimeout(120000);
    page.setViewportSize({
        width: 1920,
        height: 1920
    });

    try {
        let stores = JSON.parse(read.readFile(STORE_CONFIGURATION_FILE).content)
        let backOffice = new BackOffice(
            new Browser(page, new BasicAuth(basicAuth.username, basicAuth.password), metrics, checkoutScenario.getBackofficeBaseUrl(), targetEnv, true),
            metrics,
            120000
        )

        await backOffice.setupStores(stores, limitPerIteration, Number(exec.vu.tags.userId))
    } finally {
        page.close()
    }
}
