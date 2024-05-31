import Handler from "../handler.js";

export default class ConfigHandler extends Handler {
    get() {
        if (!this.storesConfig.length) {
            //  [{"id_store":1,"fk_currency":93,"fk_locale":66,"name":"DE"},{"id_store":2,"fk_currency":93,"fk_locale":66,"name":"AT"}]
            let stores = this.getDataFromTable('stores')
            // [{"id_locale_store":2,"fk_locale":46,"fk_store":1},{"id_locale_store":4,"fk_locale":46,"fk_store":2},{"id_locale_store":1,"fk_locale":66,"fk_store":1},{"id_locale_store":3,"fk_locale":66,"fk_store":2}]
            this.storeLocales = this.getDataFromTable('locale-stores')
            this.storeLocalesMapping = new Map()
            this.getDataFromTable('locales').map((locale) => {
                this.storeLocalesMapping.set(locale.id_locale, locale.locale_name)
            })
            // [{"id_currency_store":2,"fk_currency":61,"fk_store":1},{"id_currency_store":4,"fk_currency":61,"fk_store":2},{"id_currency_store":1,"fk_currency":93,"fk_store":1},{"id_currency_store":3,"fk_currency":93,"fk_store":2}]
            this.storeCurrencies = this.getDataFromTable('currency-stores')

            stores.map((store) => {
                store.locales = this.storeLocales.filter((locale) => locale.fk_store === store.id_store).map((locale) => locale.fk_locale)
                store.currencies = this.storeCurrencies.filter((currency) => currency.fk_store === store.id_store).map((currency) => currency.fk_currency)
                this.storesConfig.push(store)
            })

            if (this.storeWhitelist.length) {
                this.storesConfig = this.storesConfig.filter((store) => this.storeWhitelist.filter((storeCode) => storeCode.toLowerCase() === store.name.toLowerCase()).length)
                this.storeLocales = this.storeLocales.filter((locale) => this.storesConfig.filter((store) => locale.fk_store === store.id_store).length)
                this.storeCurrencies = this.storeCurrencies.filter((currency) => this.storesConfig.filter((store) => currency.fk_store === store.id_store).length)
            }
        }

        return this.storesConfig
    }

    getLocaleNameById(localeId) {
        return this.storeLocalesMapping.get(localeId)
    }

    getUniqueLocaleIds() {
        this.get()

        return [...new Set(this.storeLocales.map((el) => el.fk_locale))]
    }

    getStoreConfig(storeCode) {
        this.get()

        console.log('this.storesConfig', this.storesConfig)

        return this.storesConfig.filter((el) => el.name.toLowerCase() === storeCode.toLowerCase()).shift()
    }

    getStoreIds() {
        this.get()

        return this.storesConfig.map((store) => store.id_store)
    }
}