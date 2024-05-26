const replacement = {
    fkCategory: 4,
    fkStock: 11,
    fkProductRelationType: 1,
    fkPriceType: 1,
}

export class DataExchangePayloadGenerator {

    constructor(uuid, storeConfigHandler, stockHandler,  itemsAmount = 1000, concreteMaxAmount = 5) {
        this.storeConfigHandler = storeConfigHandler;
        this.stockHandler = stockHandler;
        this.itemsAmount = itemsAmount
        this.concreteMaxAmount = concreteMaxAmount
        this.uuid = uuid
    }

    prepareProductsForUpdate(recentlyCreatedProducts) {
        function updateFunc(product) {
            let updateConfig = {
                productAbstractProducts: {
                    is_quantity_splittable: false,
                    productSearch: {
                        is_searchable: false
                    },
                    productStocks: {
                        quantity: Math.round(Math.random() * 1000)
                    },
                    productLocalizedAttributes: {
                        description:  `productLocalizedAttributes Updated at: ${new Date().toISOString()}`
                    },
                    
                },
                productAbstractPriceProducts: {
                    price: Math.round(Math.random() * 100),
                    priceProductStores:{
                        id_price_product_store: 'toInt',
                        priceProductStoreDefaults: {
                            id_price_product_default: 'toInt',
                            fk_price_product_store: 'toInt'
                        }
                    }
                },
                productAbstractLocalizedAttributes: {
                    description:  `productAbstractLocalizedAttributes Updated at: ${new Date().toISOString()}`
                },
            }

            for (const firstLevelKey of Object.keys(updateConfig)) {
                let secondLevel = updateConfig[firstLevelKey]
                for (const secondLevelKey of Object.keys(secondLevel)) {
                    if (typeof secondLevel[secondLevelKey] === 'object') {
                        for (const thirdLevelKey of Object.keys(secondLevel[secondLevelKey])) {
                            product[firstLevelKey].map((el) => {
                                return el[secondLevelKey].map((key) => {
                                    if (Array.isArray(key[thirdLevelKey])) {
                                        key[thirdLevelKey] = key[thirdLevelKey].map((tr) => {
                                            for (const forthLevelKey of Object.keys(tr)) {
                                                if (forthLevelKey in secondLevel[secondLevelKey][thirdLevelKey]) {
                                                    if (secondLevel[secondLevelKey][thirdLevelKey][forthLevelKey] === 'toInt') {
                                                        tr[forthLevelKey] = parseInt(tr[forthLevelKey])
                                                    } else {
                                                        tr[forthLevelKey] = secondLevel[secondLevelKey][thirdLevelKey][forthLevelKey]
                                                    }
                                                }
                                            }
                                            return tr
                                        })
                                    } else {
                                        if (secondLevel[secondLevelKey][thirdLevelKey] === 'toInt') {
                                            key[thirdLevelKey] = parseInt(key[thirdLevelKey])
                                        } else {
                                            key[thirdLevelKey] = secondLevel[secondLevelKey][thirdLevelKey]
                                        }
                                    }
                                })
                            })
                        }
                    } else {
                        product[firstLevelKey][secondLevelKey] = secondLevel[secondLevelKey]
                    }
                }
            }

            return product
        }

        return JSON.stringify({
            data: recentlyCreatedProducts.map((el) => updateFunc(el))
        })
    }

    getConcrete(productConcreteTemplate, random) {
        let stores = this.storeConfigHandler.get()
        let concretes = []
        for (let index = 1; index <= this.concreteMaxAmount; index++) {
            concretes.push(productConcreteTemplate.replaceAll('{random}', `${random}-${index}`)
                .replaceAll('"SEARCH_CONFIG"', this.storeConfigHandler.getUniqueLocaleIds().map((localeId) => {
                    return JSON.stringify({
                            "fk_locale": localeId,
                            "is_searchable": true
                        },
                    )
                }).join(','))
                .replaceAll('"PRODUCT_LOCALAZID_ATTRIBUTES"', this.storeConfigHandler.getUniqueLocaleIds().map((localeId) => {
                    return JSON.stringify({
                        "fk_locale": localeId,
                        "attributes": "{\"color\":\"Weinrot\"}",
                        "description": `description for locale id: ${localeId}`,
                        "name": `test product ${random} Locale ${localeId}`
                        },
                    )
                }).join(','))
                .replaceAll('"{fkStock}"', this.stockHandler.get()))
        }

        return concretes.join(',\n')
    }

    generateProducts(productTemplate, productConcreteTemplate, productLabelId = 3) {
        let stores = this.storeConfigHandler.get()

        let result = []
        for (let index = 0; index < this.itemsAmount; index++) {
            let random = this.uuid()
            result.push(JSON.parse(productTemplate
                .replaceAll('"PRODUCT_ABSTRACT_STORES"', stores.map((store) => {
                    return JSON.stringify({"fk_store": store.id_store})
                }).join(','))
                .replaceAll('"PRODUCT_RELATION_STORES"', stores.map((store) => {
                    return JSON.stringify({"fk_store": store.id_store})
                }).join(','))
                .replaceAll('"PRODUCT_PRICE_STORES"', () => {
                    let replacement = stores.map((store) => {
                        return store.currencies.map((currencyId) => JSON.stringify({
                                "fk_currency": currencyId,
                                "fk_store": store.id_store,
                                "gross_price": 1000 * store.id_store,
                                "net_price": 999 * store.id_store,
                                "priceProductStoreDefaults": [
                                    {}
                                ]
                            }
                        ))
                    }).filter((el) => el.length)
                    if (replacement.length) {
                        return replacement.join(',')
                    }

                    return ''
                })
                .replaceAll('"PRODUCT_ABSTRACT_IMAGES_STORES"', this.storeConfigHandler.getUniqueLocaleIds().map((localeId) => {
                    return JSON.stringify(         {
                            "fk_locale": localeId,
                            "fk_product": null,
                            "name": "${random}"
                        },
                    )
                }).join(','))
                .replaceAll('"PRODUCT_LOCALISED_ATTRIBUTES"', this.storeConfigHandler.getUniqueLocaleIds().map((localeId) => {
                    return JSON.stringify({
                           "fk_locale": localeId,
                           "attributes": "{\"color\":\"Weinrot\"}",
                           "description": `description for locale id: ${localeId}`,
                           "meta_description": `meta description for locale id: ${localeId}`,
                           "meta_keywords": `meta keywords for locale id: ${localeId}`,
                           "meta_title": `meta product title test product  for locale id: ${localeId}`,
                           "name": `test product ${random} Locale ${localeId}`
                       },
                    )
                }).join(','))
                .replaceAll('{random}', random)
                .replaceAll('"{fkCategory}"', replacement.fkCategory)
                .replaceAll('"{fkStock}"', this.stockHandler.get())
                .replaceAll('"{fkProductRelationType}"', replacement.fkProductRelationType)
                .replaceAll('"{fkPriceType}"', replacement.fkPriceType)
                .replaceAll('"{fkProductLabel}"', String(productLabelId))
                .replaceAll('"{CONCRETES}"', this.getConcrete(productConcreteTemplate, random))))
        }

        return JSON.stringify({
            data: result
        })
    }

    generateImageSet(productImageTemplate, productImageSetIdsMap) {
        let result = []
        for (const key of productImageSetIdsMap.keys()) {
            result.push(JSON.parse(productImageTemplate
                .replaceAll('"{fkProductImageSet}"', productImageSetIdsMap.get(key))
                .replaceAll('{random}', key)))
        }

        return JSON.stringify({
            data: result
        })
    }

    generateLabel(productLabelTemplate) {
        let result = []
        let stores = this.storeConfigHandler.get()
        result.push(JSON.parse(productLabelTemplate
            .replaceAll('{random}', this.uuid())
            .replaceAll('"PRODUCT_LABELS_STORES_CONFIG"', stores.map((store) => {
                return JSON.stringify({"fk_store": store.id_store})
            }).join(','))
        ))

        return JSON.stringify({
            data: result
        })
    }
}