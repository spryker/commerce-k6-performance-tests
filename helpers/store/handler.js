import {debug, getIteration, getThread} from "../../lib/utils.js";
import {AssertionsHelper} from "../assertions-helper.js";

export default class Handler {
    constructor(http, urlHelper, bapiHelper, storeWhitelist = []) {
        this.storeWhitelist = storeWhitelist;
        this.http = http;
        this.urlHelper = urlHelper;
        this.bapiHelper = bapiHelper;
        this.assertionHelper = new AssertionsHelper();
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

    assignExistingEntitiesToStores(entityConfigs, storeConfig) {
        let result = []
        for (const sourceConfig of entityConfigs) {
            console.log('sourceConfig', sourceConfig)
            let data = this.getDataFromTable(sourceConfig.read_entity.table)
            let activeEntities = data.filter((el) => el.is_active)
            let entityStores =  this.getDataFromTable(sourceConfig.write_entity.table)

            let payload = []
            storeConfig.map((store) => {
                activeEntities.map((entity) => {
                    if (entityStores.filter((el) => el[sourceConfig.write_entity.fk] === entity[sourceConfig.read_entity.fk] && el.fk_store === store.id_store).length) {
                        return
                    }

                    payload.push(Object.fromEntries([
                        [
                            sourceConfig.write_entity.fk,
                            entity[sourceConfig.read_entity.fk]
                        ],
                        [
                            'fk_store',
                            store.id_store
                        ]
                    ]))
                })
            })

            if (payload.length) {
                result.push(this.createEntities(sourceConfig.write_entity.table, JSON.stringify({
                    data: payload
                })))
            }
        }
        return result
    }

    assignAttributesToLocales(entityConfigs, localesIds) {
        let result = []
        for (const sourceConfig of entityConfigs) {
            let data = this.getDataFromTable(sourceConfig.read_entity.table)
            let activeEntities = data.filter((el) => el.is_active)
            let entityAttributes =  this.getDataFromTable(sourceConfig.write_entity.table)

            let payload = []
            localesIds.map((localeId) => {
                activeEntities.map((entity) => {
                    if (entityAttributes.filter((el) => el[sourceConfig.write_entity.fk] === entity[sourceConfig.read_entity.fk] && el.fk_locale === localeId).length) {
                        return
                    }


                    payload.push(Object.fromEntries([
                        [
                            sourceConfig.write_entity.fk,
                            entity[sourceConfig.read_entity.fk]
                        ],
                        [
                            'fk_locale',
                            localeId
                        ],
                        [
                            'name',
                            entity.category_key
                        ]
                    ]))
                })
            })

            if (payload.length) {
                result.push(this.createEntities(sourceConfig.write_entity.table, JSON.stringify({
                    data: payload
                })))
            }
        }
        return result
    }

    validateResponses(responses) {
        for (const response of responses) {
            this.assertionHelper.assertResponseStatus(response, 201, response.url)
        }
    }
}