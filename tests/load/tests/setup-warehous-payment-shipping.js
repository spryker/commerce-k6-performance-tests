import {
    getBasicAuthCredentials,
    getStoreWhiteList,
    loadDefaultOptions,
    loadEnvironmentConfig
} from '../../../lib/utils.js';
import {Http} from "../../../lib/http.js";
import {UrlHelper} from "../../../helpers/url-helper.js";
import CustomerHelper from "../../../helpers/customer-helper.js";
import AdminHelper from "../../../helpers/admin-helper.js";
import {AssertionsHelper} from "../../../helpers/assertions-helper.js";
import {CartHelper} from "../../../helpers/cart-helper.js";
import {BapiHelper} from "../../../helpers/bapi-helper.js";
import ConfigHandler from "../../../helpers/store/handler/configHandler.js";
import StockHandler from "../../../helpers/store/handler/stockHandler.js";
import ShipmentHandler from "../../../helpers/store/handler/shipmentHandler.js";
import PaymentHandler from "../../../helpers/store/handler/paymentHandler.js";
import { sleep } from 'k6'
import CategoryHandler from "../../../helpers/store/handler/categoryHandler.js";

export const options = loadDefaultOptions();
let configurationArray = [
    ['DMS_STORE_SETUP', {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '5m',
        exec: 'generateConfiguration',
    }]
]

options.scenarios = Object.fromEntries(configurationArray)

const targetEnv = __ENV.DATA_EXCHANGE_ENV

let http = new Http(targetEnv);
let targetEnvConfig = loadEnvironmentConfig(targetEnv);
let urlHelper = new UrlHelper(targetEnvConfig);
let adminHelper = new AdminHelper();
let assertionsHelper = new AssertionsHelper();
let bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionsHelper);
let storeConfig = new ConfigHandler(http, urlHelper, bapiHelper, getStoreWhiteList())
let stockHandler = new StockHandler(http, urlHelper, bapiHelper, getStoreWhiteList())
let paymentHandler = new PaymentHandler(http, urlHelper, bapiHelper, getStoreWhiteList())
let shipmentHandler = new ShipmentHandler(http, urlHelper, bapiHelper, getStoreWhiteList())
let categoryHandler = new CategoryHandler(http, urlHelper, bapiHelper, getStoreWhiteList())

export function generateConfiguration() {
    stockHandler.setup(storeConfig.get())
    paymentHandler.setup(storeConfig.get())
    shipmentHandler.setup(storeConfig.get())
    categoryHandler.setup(storeConfig.get(), storeConfig.getUniqueLocaleIds())
}
