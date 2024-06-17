import {countryMap} from '../../tests/dex/tests/data/countryEuropeMap.js';
import faker from 'k6/x/faker';
import {sortRandom} from '../../lib/utils.js';

export default class ConfigGenerator {
    storeCodesToExclude

    constructor(storeCodesToExclude = ['DE', 'AT']) {
        this.storeCodesToExclude = new Map(storeCodesToExclude.map(el => [el.toLowerCase(), 1]))
        this.randomiser = [
            faker.word.noun,
            faker.animal.bird,
            faker.car.car,
            faker.movie.movie,
            faker.person.firstName,
            faker.person.lastName
        ]
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
    generate(amountOfStores = 8, amountOfLocales = 2, amountOfCurrencies = 2, amountOfShippingCountries = 8) {
        let countries = this._shuffleArray(Object.keys(countryMap)).filter(el => !this.storeCodesToExclude.has(el.toLowerCase()))

        let initialCountriesList = countries
        countries = countries.length >= amountOfStores ? countries.slice(0, amountOfStores) : countries
        amountOfCurrencies = this._validateAmount(amountOfCurrencies, amountOfStores)
        amountOfShippingCountries = this._validateAmount(amountOfShippingCountries, amountOfStores)
        let targetConfig = new Map()

        let countryCode = 'DE'
        let referenceStore = {
            storeCode: `${countryCode}`,
            defaultLocale: countryMap[countryCode].languageLocales[0],
            locales: this._generateLocaleList(countryCode, amountOfLocales > amountOfStores ? initialCountriesList : countries, amountOfLocales),
            defaultCurrency: countryMap[countryCode].currencyCode,
            currencies: this._generateCurrencyList(countryCode, amountOfCurrencies > amountOfStores ? initialCountriesList : countries, amountOfCurrencies),
            shipmentCountries: this._generateShippingCountriesList(amountOfShippingCountries > amountOfStores ?
                initialCountriesList : countryCode, countries, amountOfShippingCountries)
        }

        countries.map(countryCode => {
            targetConfig.set(countryCode, {
                storeCode: `${countryCode}`,
                defaultLocale: countryMap[countryCode].languageLocales[0],
                locales: this._generateLocaleList(countryCode, amountOfLocales > amountOfStores ? initialCountriesList : countries, amountOfLocales),
                defaultCurrency: countryMap[countryCode].currencyCode,
                currencies: this._generateCurrencyList(countryCode, amountOfCurrencies > amountOfStores ? initialCountriesList : countries, amountOfCurrencies),
                shipmentCountries: this._generateShippingCountriesList(amountOfShippingCountries > amountOfStores ?
                    initialCountriesList : countryCode, countries, amountOfShippingCountries)
            })
        })

        return this._extendListIfLessThanRequested(targetConfig, amountOfStores, referenceStore)
    }

    _getNewCode(referenceStoreCode, targetConfig, fakerFunction) {
        const regex = /[^a-zA-Z0-9-]+/g;
        let newCode = [String(fakerFunction()).toUpperCase(), referenceStoreCode].join('_').replace(regex, '_')

        if (this.storeCodesToExclude.has(newCode.toLowerCase()) || targetConfig.has(newCode)) {
            return this._getNewCode(referenceStoreCode, targetConfig, sortRandom(this.randomiser)[0])
        }

        return newCode
    }

    _extendListIfLessThanRequested(targetConfig, amountOfStores, referenceStore) {
        if (targetConfig.size < amountOfStores) {
            while (targetConfig.size < amountOfStores) {
                let newCode = this._getNewCode(referenceStore.storeCode, targetConfig, this.randomiser[0])
                console.log(targetConfig.size, newCode)
                let el = {}
                Object.keys(referenceStore).map((key) => {
                    el[key] = referenceStore[key]
                    if (key === 'storeCode') {
                        el[key] = newCode
                    }
                })

                targetConfig.set(newCode, el)
            }
        }
        return [...targetConfig.values()]
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