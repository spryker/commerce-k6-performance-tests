import {
    getStoreWhiteList,
    loadDefaultOptions,
    loadEnvironmentConfig
} from '../../../lib/utils.js';
import {Metrics} from '../../../helpers/browser/metrics.js';
import ConfigGenerator from '../../../helpers/dynamicEntity/configGenerator.js';
import file from 'k6/x/file';
import read from 'k6/x/read';
import {Http} from '../../../lib/http.js';
import {UrlHelper} from '../../../helpers/url-helper.js';
import AdminHelper from '../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../helpers/assertions-helper.js';
import {BapiHelper} from '../../../helpers/bapi-helper.js';
import StoreHandler from '../../../helpers/dynamicEntity/handler/storeHandler.js';
import Handler from '../../../helpers/dynamicEntity/handler.js';

let metricsConfig = [
    'store-gui-create',
    'security-gui-login',
    'store-gui-list-table',
].map((code) => {
    return {
        key: `${code}_loading_time`,
        isTime: {
            trend: true,
            counter: false
        },
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
    isTime: {
        trend: false,
        counter: false
    },
    thresholds: {}
})

const metrics = new Metrics(metricsConfig);
const targetAmountOfStores = Number(__ENV.DMS_AMOUNT_OF_STORES)
const targetAmountOfLocales = Number(__ENV.DMS_AMOUNT_OF_LOCALES)
export const options = loadDefaultOptions();

let configurationArray = [
    ['DMS_STORE_GENERATE_CONFIGURATION', {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '5m',
        exec: 'generateConfiguration',
    }],
    ['DMS_STORE_SETUP_JOB', {
        exec: 'executeStoresSetup',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'DMS_STORE_SETUP_JOB',
            testGroup: 'Data Exchange',
        },
        iterations: 1,
        vus: 1,
        maxDuration: '1200m',
        startTime: '10s'
    }]
]

options.scenarios = Object.fromEntries(configurationArray)
options.thresholds = metrics.getThresholds()

const targetEnv = __ENV.DATA_EXCHANGE_ENV
let http = new Http(targetEnv);
let targetEnvConfig = loadEnvironmentConfig(targetEnv);
let urlHelper = new UrlHelper(targetEnvConfig);
let adminHelper = new AdminHelper();
let assertionsHelper = new AssertionsHelper();
let bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionsHelper);

const STORE_CONFIGURATION_FILE = __ENV.DMS_STORES_CONFIGURATION_FILE

export function generateConfiguration() {
    let availableStores = new Handler(http, urlHelper, bapiHelper).getDataFromTable('stores').map((store) => store.name)
    let stores = new ConfigGenerator(availableStores).generate(targetAmountOfStores, targetAmountOfLocales)
    if (stores.length) {
        console.info(`Stores generated for setup(${stores.length}): `, stores.map((store) => store.storeCode).join(','))
    } else {
        console.warn(`All combinations supported by store generator already available in system: ${availableStores.join(',').toLowerCase()}`)
    }
    file.writeString(STORE_CONFIGURATION_FILE, JSON.stringify(stores));
}

export async function executeStoresSetup() {
    let stores = JSON.parse(read.readFile(STORE_CONFIGURATION_FILE).content)
    let storeHandler = new StoreHandler(http, urlHelper, bapiHelper, getStoreWhiteList())
    storeHandler.setup(stores)
}
