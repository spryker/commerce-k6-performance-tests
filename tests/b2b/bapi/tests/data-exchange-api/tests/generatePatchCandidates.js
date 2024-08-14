import {
    loadDefaultOptions, loadEnvironmentConfig,
} from '../../../../../../lib/utils.js';
import file from 'k6/x/file';
import {Http} from '../../../../../../lib/http.js';
import {UrlHelper} from '../../../../../../helpers/url-helper.js';
import AdminHelper from '../../../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../../../helpers/assertions-helper.js';
import {BapiHelper} from '../../../../../../helpers/bapi-helper.js';
import Handler from '../../../../../../helpers/dynamicEntity/handler.js';

export const options = loadDefaultOptions();

options.scenarios = {
    ProductPatchPricesGenerateCandidatesForUpdateVUS: {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '30m',
        exec: 'generateProductList',
    },

};

const PRODUCT_UPDATE_LIST_FILE = 'tests/dex/tests/data/products_for_update.json'

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const http = new Http(targetEnv)
const envConfig = loadEnvironmentConfig(targetEnv)
const urlHelper = new UrlHelper(envConfig)
const adminHelper = new AdminHelper()
const assertionHelper = new AssertionsHelper()
const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper)
const limit = 100
const targetSize = parseInt(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH)
const requestHandler = new Handler(http, urlHelper, bapiHelper)

export function generateProductList() {
    let products = []
    let offset = 0
    let result = []
    do {
        result = requestHandler.getDataFromTable(`product-abstracts?include=productAbstractProducts,productAbstractProducts.productStocks,productAbstractPriceProducts.priceProductStores&page[offset]=${offset}&page[limit]=${limit}`)
        offset += limit
        products.push(...result)
    } while (result.length > 0 && products.length < targetSize)

    file.writeString(PRODUCT_UPDATE_LIST_FILE, JSON.stringify(products));
}
