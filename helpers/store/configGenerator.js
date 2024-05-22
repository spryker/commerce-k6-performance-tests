import {countryMap} from "../../tests/load/tests/data/countryEuropeMap.js";

export default class ConfigGenerator {
    storeCodesToExclude 
    
    constructor(storeCodesToExclude = ['DE', 'AT']) {
        this.storeCodesToExclude = storeCodesToExclude
    }

    /**
     * [
     *     {
     *             storeCode: 'FR',
     *             defaultLocale: 'fr_FR',
     *             locales: ['de_DE', 'en_US', 'ru_RU', 'fr_FR', 'fr_CA', 'fr_CH'],
     *             defaultCurrency: 'EUR',
     *             currencies: ['CHF', 'EUR'],
     *             shipmentCountries: ['FR', 'DE', 'AT']
     *      }
     * ]
     *
     * @param amountOfStores
     * @param amountOfLocales
     * @param amountOfCurrencies
     * @param amountOfShippingCountries
     */
    generate(amountOfStores = 8, amountOfLocales = 8, amountOfCurrencies = 8, amountOfShippingCountries = 8) {
        let countries = this._shuffleArray(Object.keys(countryMap)).filter(el => this.storeCodesToExclude.filter(exclude => el.toLowerCase() === exclude.toLowerCase()).length === 0)
        countries = countries.length >= amountOfStores ? countries.slice(0, amountOfStores) : countries
        amountOfLocales = this._validateAmount(amountOfLocales, amountOfStores)
        amountOfCurrencies = this._validateAmount(amountOfCurrencies, amountOfStores)
        amountOfShippingCountries = this._validateAmount(amountOfShippingCountries, amountOfStores)
       
        countries = countries.map(countryCode => {
            return {
                storeCode: countryCode,
                defaultLocale: countryMap[countryCode].languageLocales[0],
                locales: this._generateLocaleList(countryCode, countries, amountOfLocales),
                defaultCurrency: countryMap[countryCode].currencyCode,
                currencies: this._generateCurrencyList(countryCode, countries, amountOfCurrencies),
                shipmentCountries: this._generateShippingCountriesList(countryCode, countries, amountOfShippingCountries)
            }
        })
        

        return this._extendListIfLessThanRequested(countries)
    }

    _extendListIfLessThanRequested(countries, amountOfStores) {
        let deltaSetSize = countries.length < amountOfStores ? amountOfStores - countries.length : 0
       
        if (deltaSetSize) {
            countries.push(...countries.slice(0, deltaSetSize).map(el => {
                el.storeCode = `${el.storeCode}_ADDON`

                return el
            }))
        }

        return countries
    }

    _validateAmount(amount, limit) {
        return amount > limit ? limit : amount
    }

    _generateLocaleList(targetCountry, countries, amount) {

        let result = [countryMap[targetCountry].languageLocales[0]]
        for (const code of countries) {
            if (code !== targetCountry && result.length < amount) {
                result.push(countryMap[code].languageLocales[0])
            }
        }
        return [...new Set([...result])]
    }

    _generateCurrencyList(targetCountry, countries, amount) {
        let result = [countryMap[targetCountry].currencyCode]
        for (const code of countries) {
            if (code !== targetCountry && result.length < amount) {
                result.push(countryMap[code].currencyCode)
            }
        }
        return [...new Set([...result])]
    }

    _generateShippingCountriesList(targetCountry, countries, amount) {
        let result = [targetCountry]
        for (const code of countries) {
            if (code !== targetCountry && result.length < amount) {
                result.push(code)
            }
        }
        return result
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}