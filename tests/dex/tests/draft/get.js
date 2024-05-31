import {loadDefaultOptions, loadEnvironmentConfig} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';

export const options = loadDefaultOptions()

options.scenarios = {
    CompanyGetVUS: {
        exec: 'getCompany',
        executor: 'shared-iterations',
        tags: {
            testId: 'CompanyGet',
            testGroup: 'DataExchange'
        },
        iterations: 100,
        vus: 4
    }
}

const targetEnv = __ENV.DATA_EXCHANGE_ENV
const http = new Http(targetEnv)
const targetEnvConfiguration = loadEnvironmentConfig(targetEnv)
const urlHelper = new UrlHelper(targetEnvConfiguration)
const adminHelper = new AdminHelper()
const assertionHelper = new AssertionsHelper()

const bapiHelper = new BapiHelper(urlHelper, http, adminHelper, assertionHelper)

const requestHandler = new Handler(http, urlHelper, bapiHelper)
export function getCompany(){
    requestHandler.getDataFromTable('companies')
}