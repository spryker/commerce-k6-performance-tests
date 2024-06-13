import Handler from '../handler.js';

export default class StoreHandler extends Handler {
    setup(storeCreationConfig) {
        let results = []
        let storeConfig = this.createStores(storeCreationConfig)

        for (const store of storeCreationConfig) {
            storeConfig.filter((el) => el.name === store.storeCode).map((el) => {
                store.id_store = el.id_store
            })

            let entityConfigs = [
                {
                    read_entity: {
                        table: 'locales',
                        fk: 'id_locale'
                    },
                    write_entity: {
                        table: 'locale-stores',
                        fk: 'fk_locale'
                    },
                    entitiesToFilter: store.locales,
                    filterKey: 'locale_name'
                },
                {
                    read_entity: {
                        table: 'countries',
                        fk: 'id_country'
                    },
                    write_entity: {
                        table: 'country-stores',
                        fk: 'fk_country'
                    },
                    entitiesToFilter: store.shipmentCountries,
                    filterKey: 'iso2_code'
                },
                {
                    read_entity: {
                        table: 'currencies',
                        fk: 'id_currency'
                    },
                    write_entity: {
                        table: 'currency-stores',
                        fk: 'fk_currency'
                    },
                    entitiesToFilter: store.currencies,
                    filterKey: 'code'
                }
            ]
            results.push(...this.assignExistingEntitiesToStore(entityConfigs, store))
        }

        this.validateResponses(results)
    }

    createStores(storeCreationConfig) {
        let locales = this.getDataFromTable('locales')
        let currencies = this.getDataFromTable('currencies')
        let payload = []
        for (const store of storeCreationConfig) {
            payload.push({
                fk_currency: (currencies.filter((currency) => currency.code === store.defaultCurrency).shift()).id_currency,
                fk_locale: (locales.filter((locale) => locale.locale_name === store.defaultLocale).shift()).id_locale,
                name: store.storeCode,
            })
        }
        if (payload.length) {
            let response = this.createEntities('stores', JSON.stringify({
                data: payload
            }))

            this.assertionHelper.assertResponseStatus(response, 201, response.url)
        }

        return this.getDataFromTable('stores').filter((store) => payload.filter((newStore) => store.name === newStore.name).length)
    }

    assignExistingEntitiesToStore(entityConfigs, store) {
        let result = []

        for (const sourceConfig of entityConfigs) {
            let payload = []
            let data = this.getDataFromTable(sourceConfig.read_entity.table)
            let entityStores = this.getDataFromTable(sourceConfig.write_entity.table)
            let activeEntities = data.filter((el) => sourceConfig.entitiesToFilter.filter((ent) => ent === el[sourceConfig.filterKey]).length)
            activeEntities.map((entity) => {
                if (entityStores.filter((el) => el[sourceConfig.write_entity.fk] === entity[sourceConfig.read_entity.fk] && el.fk_store === store.id_store).length) {
                    return entity
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

            if (payload.length) {
                result.push(this.createEntities(sourceConfig.write_entity.table, JSON.stringify({
                    data: payload
                })))
            }
        }
        return result
    }
}