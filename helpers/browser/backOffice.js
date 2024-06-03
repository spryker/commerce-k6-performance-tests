import {sleep} from 'k6';
import {check} from 'k6';

export default class BackOffice {
    constructor(browser, metrics, timeout) {
        this.browser = browser
        this.metrics = metrics
        this.timeout = timeout;
    }

    getStoresForUser(storesConfig, limitPerIteration, virtualUser) {
        let startIndex = limitPerIteration * (virtualUser - 1)
        let endIndex = limitPerIteration * virtualUser
        endIndex = endIndex > storesConfig.length ? storesConfig.length : endIndex

        console.warn(`Amount of stores: ${storesConfig.length}, Limit per user: ${limitPerIteration}, User number: ${virtualUser}, Start index: ${startIndex}, endIndex: ${endIndex}`)

        return storesConfig.slice(startIndex, endIndex)
    }

    async setupStores(storesConfig, limitPerIteration, virtualUser) {
        let stores = this.getStoresForUser(storesConfig, limitPerIteration, virtualUser)
        if (!stores.length) {
            console.warn(`For the given virtual user there are no stores available for setup. Amount of stores: ${storesConfig.length}, Limit per user: ${limitPerIteration}, User number: ${virtualUser}`)
            return
        }

        await this.auth()
        this.browser.screen()
        let storesToCreate = []
        let retryLimit = 5
        let missedStores = []
        do {
            for (const storeConfig of stores) {
                storesToCreate.push(storeConfig.storeCode)
                let missedStores = await this.getMissedStores([storeConfig.storeCode])
                if (missedStores.length === 0) {
                    continue
                }
                try {
                    this.browser.resetCounter()
                    await this.setupStore(storeConfig)
                    this.browser.screen()
                } catch (e) {
                    console.log(`error during store creation ${storeConfig.storeCode}`, e)
                }
            }

            missedStores = await this.validateCreatedStores(storesToCreate)
            stores = stores.filter(storeConfig => {
                return missedStores.filter(el => storeConfig.storeCode === el).length
            })
            retryLimit--
        } while(stores.length && retryLimit)
    }

    async getMissedStores(expectedStores = []) {
        await this.browser.visitPage('/store-gui/list/table?length=100')
        await this.browser.waitUntilLoad('networkidle')

        const rowsLocator = this.browser.page.content();
        const configMatch = rowsLocator.match(/(\{[^;]*\})/);
        let configs = {}
        let stores = new Map()
        if (configMatch && configMatch[0]) {
            try {
                configs = JSON.parse(configMatch[0]);
                if ('data' in configs) {
                    configs.data.map(el => {
                        stores.set(el[1], 1)
                    })
                }
            } catch (error) {
                console.error('Error parsing configs:', error);
            }
        }

        return expectedStores.filter(el => !stores.has(el))
    }

    async validateCreatedStores(storesToCreate) {
        this.browser.addStep('Validate Created Store')

        this.browser.screen()
        let missedStores = await this.getMissedStores(storesToCreate)
        let result = check(missedStores, {
            'All stores successfully created': (missedStores) => missedStores.length === 0,
        });

        if (!result) {
            console.warn(`Missed Stores: ${JSON.stringify(missedStores)}`);
        }
        return missedStores
    }

    async setupStore(storeConfig) {
        this.browser.setStore(storeConfig.storeCode)

        let storeCreationFormFlow = [
            [
                {
                    'type': 'step',
                    'value': `Fill Store Name: ${storeConfig.storeCode}`
                },
                {
                    'type': 'fill',
                    'locator': '[name="store[name]"]',
                    'value': storeConfig.storeCode,
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'screen',
                    'value': `${storeConfig.storeCode} store form filled`
                },
                {
                    'type': 'click',
                    'locator': 'a[class="btn btn-tab-next btn-outline btn-view"]',
                    'value': ''
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
            ],
            [
                {
                    'type': 'step',
                    'value': 'Select Default Locale'
                },
                {
                    'type': 'select',
                    'locator': '[name="store[defaultLocaleIsoCode]"]',
                    'value': storeConfig.defaultLocale
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'screen',
                    'value': `${storeConfig.defaultLocale} locale selected`
                },
                {
                    'type': 'select',
                    'locator': 'select[name="available-locale-table_length"]',
                    'value': '100'
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
            ],
            ...storeConfig.locales.map(locale => ([
                {
                    'type': 'step',
                    'value': `Search for locale: ${locale}`
                },
                {
                    'type': 'fill',
                    'locator': 'div#available-locale-table_filter input[type="search"][aria-controls="available-locale-table"]',
                    'value': locale
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'click',
                    'locator': `input[value="${locale}"]`,
                    'value': ''
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'screen',
                    'value': `${locale} locale checked`,
                },
            ])),
            [
                {
                    'type': 'click',
                    'locator': 'a[class="btn btn-tab-next btn-outline btn-view"]',
                    'value': ''
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'step',
                    'value': `Fill Default Currency For Store: ${storeConfig.storeCode}: ${storeConfig.defaultCurrency}`
                },
                {
                    'type': 'select',
                    'locator': '[name="store[defaultCurrencyIsoCode]"]',
                    'value': storeConfig.defaultCurrency
                },
                {
                    'type': 'screen',
                    'value': `${storeConfig.defaultCurrency} default currency selected`
                },
                {
                    'type': 'step',
                    'value': 'Select available countries'
                },
            ],
            ...storeConfig.currencies.map(currency => ([
                {
                    'type': 'step',
                    'value': `Search for currency: ${currency}`
                },
                {
                    'type': 'fill',
                    'locator': 'div#available-currency-table_filter input[type="search"][aria-controls="available-currency-table"]',
                    'value': currency
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'click',
                    'locator': `input[value="${currency}"]`
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'screen',
                    'value': `${currency}  currency selected`
                },
            ])),
            [
                {
                    'type': 'scrollDown',
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'click',
                    'locator': 'a[class="btn btn-tab-next btn-outline btn-view"]'
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'step',
                    'value': 'Select shipment countries'
                },
            ],
            ...storeConfig.shipmentCountries.map(country => ([
                {
                    'type': 'step',
                    'value': `Search for shipment: ${country}`
                },
                {
                    'type': 'fill',
                    'locator': 'div#available-country-table_filter input[type="search"][aria-controls="available-country-table"]',
                    'value': country
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'click',
                    'locator': `input[value="${country}"]`
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'screen',
                    'value': `${country}  shipment country selected`
                },
            ])),
            [
                {
                    'type': 'scrollDown',
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
            ]
        ]

        this.browser.addStep('Visit Store Configuration Page')
        await this.browser.visitPage('store-gui/create')
        await this.browser.waitUntilLoad()

        for (const dataSet of storeCreationFormFlow) {
            let retry = 5
            let res = false;
            do {
                res = await this.browser.fillForm(dataSet)
                retry--
                sleep(5);
                this.browser.screen({fullPage: true})
            } while (!res && retry > 0)
        }

        this.browser.addStep(`Create Store ${storeConfig.storeCode}`)
        await this.browser.click('input[type="submit"]', {waitForNavigation: true}, this.timeout)
        await this.browser.waitUntilLoad()
        this.browser.screen({fullPage: true})
    }

    async auth() {
        this.browser.addStep('Login to BackOffice')
        await this.browser.visitPage('security-gui/login')
        this.browser.addStep('Fill Admin Auth Credentials')

        await this.browser.fillForm([
            {
                'type': 'fill',
                'locator': '[name="auth[username]"]',
                'value': 'admin@spryker.com',
            },
            {
                'type': 'fill',
                'locator': '[name="auth[password]"]',
                'value': 'change123',
            }
        ])

        await this.browser.click('button[type="submit"]', {waitForNavigation: true}, this.timeout)
    }
}