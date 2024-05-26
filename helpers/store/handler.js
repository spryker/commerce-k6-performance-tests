import {debug, getIteration, getThread} from "../../lib/utils.js";

export default class Handler {
    constructor(http, urlHelper, bapiHelper, storeWhitelist = []) {
        this.storeWhitelist = storeWhitelist;
        this.http = http;
        this.urlHelper = urlHelper;
        this.bapiHelper = bapiHelper;
        this.storesConfig = []
        this.storeLocales = []
        this.storeCurrencies = []
    }

    getTableAlias() {
        throw new Error('Method getTableAlias is not implemented.')
    }

    getRequestParams() {
        const requestParams = this.bapiHelper.getParamsWithAuthorization();
        requestParams.thresholds = {}
        requestParams.timeout = '180s'
        delete(requestParams.headers['Content-Type'])
        requestParams.headers['accept'] = 'application/json'
        debug('Authorisation params:', requestParams)

        return requestParams
    }

    getDataFromTable(tableAlias) {
        try  {
            let info = this.http.sendGetRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, this.getRequestParams(), false);

            return JSON.parse(info.body)
        } catch (e) {
            return []
        }
    }

    createEntities(tableAlias, payload) {
        let response = this.http.sendPostRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, payload, this.getRequestParams(), false);

        debug(`${tableAlias} response`, response)
        debug('thread:', getThread(), 'iteration:', getIteration(), 'response.status', response.status, new Date().toLocaleString())

        return response
    }
}