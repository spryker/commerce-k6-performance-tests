import {debug, getIteration, getThread} from '../../lib/utils.js';
import {AssertionsHelper} from '../assertions-helper.js';

export default class Handler {
    constructor(http, urlHelper, bapiHelper, storeWhitelist = [], useDefaultStoreLocale = false) {
        this.storeWhitelist = storeWhitelist;
        this.useDefaultStoreLocale = useDefaultStoreLocale;
        this.http = http;
        this.urlHelper = urlHelper;
        this.bapiHelper = bapiHelper;
        this.assertionHelper = new AssertionsHelper();
        this.storesConfig = []
        this.storeLocales = []
        this.storeCurrencies = []
        this.lastResponse = null
    }

    getTableAlias() {
        throw new Error('Method getTableAlias is not implemented.')
    }

    validateEntitiesAvailability(entityList) {
        let notAvailable = []
        for (const entity of entityList) {
            this.getDataFromTableWithPagination(entity, 1, null, 1)
            if (this.getLastResponse().status !== 200) {
                notAvailable.push(entity)
            }
        }

        if (notAvailable.length) {
            throw new Error(`Detected misconfiguration for dynamic entities: ${notAvailable.join(',')}`)
        }
    }

    getRequestParams() {
        const requestParams = this.bapiHelper.getParamsWithAuthorization();
        // requestParams.thresholds = {}
        requestParams.timeout = '180s'
        delete(requestParams.headers['Content-Type'])
        requestParams.headers['accept'] = 'application/json'
        debug('Authorisation params:', requestParams)

        return requestParams
    }

    getLastResponse() {
        return this.lastResponse
    }

    getDataFromTable(tableAlias) {
        try {
            this.lastResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, this.getRequestParams(), false);

            if (this.lastResponse.status !== 200) {
                console.error(JSON.parse(this.lastResponse.body))
            }

            this.assertionHelper.assertResponseStatus(this.lastResponse, 200, this.lastResponse.url)

            return JSON.parse(this.lastResponse.body)
        } catch (e) {
            return []
        }
    }

    getDataFromTableWithPagination(tableAlias, limitPerPage = 500, filterCallback = null, desiredAmount = 0) {
        let result = []
        let res = []
        let offset = 0
        let filter = ''
        let stop = false

        let joinSymbol = '?'
        if (tableAlias.includes('?')) {
            joinSymbol = '&'
        }

        do {
            console.warn(`Request to get data with page[offset]=${offset}&page[limit]=${limitPerPage}`)
            filter = `page[offset]=${offset}&page[limit]=${limitPerPage}`
            res = this.getDataFromTable([tableAlias, filter].join(joinSymbol))
            stop = Boolean(desiredAmount > 0 ? result.length >= desiredAmount || !res.length : !res.length)

            if (typeof filterCallback === 'function') {
                res = res.filter(filterCallback)
            }
            result.push(...res)
            offset += limitPerPage
        } while (!stop)

        return result
    }

    createEntities(tableAlias, payload, expectedStatus = 201) {
        let response = this.http.sendPostRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, payload, this.getRequestParams(), false);

        debug(`${tableAlias} response`, response)
        debug('thread:', getThread(), 'iteration:', getIteration(), 'response.status', response.status, new Date().toLocaleString())
        this.assertionHelper.assertResponseStatus(response, expectedStatus)
        this.lastResponse = response

        return response
    }

    updateEntities(tableAlias, payload, expectedStatus = 200) {
        let response = this.http.sendPatchRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, payload, this.getRequestParams(), false);

        debug(`${tableAlias} response`, response)
        debug('thread:', getThread(), 'iteration:', getIteration(), 'response.status', response.status, new Date().toLocaleString())
        this.assertionHelper.assertResponseStatus(response, expectedStatus)
        this.lastResponse = response

        return response
    }

    assignExistingEntitiesToStores(entityConfigs, storeConfig) {
        let result = []
        for (const sourceConfig of entityConfigs) {
            console.log('sourceConfig', sourceConfig)
            let data = this.getDataFromTable(sourceConfig.read_entity.table)
            let activeEntities = data.filter((el) => el.is_active)
            let entityStores = this.getDataFromTable(sourceConfig.write_entity.table)

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
            let entityAttributes = this.getDataFromTable(sourceConfig.write_entity.table)

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
            if (!this.assertionHelper.assertResponseStatus(response, 201, response.url)) {
                console.error(response.body)
            }
        }
    }
}