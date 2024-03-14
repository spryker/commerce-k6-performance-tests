const replacement = {
    fkStoreDe: 1,
    fkStoreAt: 2,
    fkCategory: 5,
    fkStock: 1,
    fkProductRelationType: 1,
    fkPriceType: 1,
    fkCurrency: 93,
    fkLocaleEn: 66,
    fkLocaleDe: 46
}

export class DataExchangePayloadGenerator {

    constructor(uuid, itemsAmount = 1000, concreteMaxAmount = 5) {
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
                            id_price_product_default: "toInt",
                            fk_price_product_store: "toInt"
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
        let concretes = []
        for (let index = 1; index <= this.concreteMaxAmount; index++) {
            concretes.push(
                productConcreteTemplate.replaceAll('{random}', `${random}-${index}`)
                    .replaceAll('"{fkStoreDe}"', replacement.fkStoreDe)
                    .replaceAll('"{fkStoreAt}"', replacement.fkStoreAt)
                    .replaceAll('"{fkCategory}"', replacement.fkCategory)
                    .replaceAll('"{fkStock}"', replacement.fkStock)
                    .replaceAll('"{fkProductRelationType}"', replacement.fkProductRelationType)
                    .replaceAll('"{fkPriceType}"', replacement.fkPriceType)
                    .replaceAll('"{fkCurrency}"', replacement.fkCurrency)
                    .replaceAll('"{fkLocaleEn}"', replacement.fkLocaleEn)
                    .replaceAll('"{fkLocaleDe}"', replacement.fkLocaleDe)
            )
        }

        return concretes.join(',\n')
    }

    generateProducts(productTemplate, productConcreteTemplate, productLabelId = 3) {
        let result = []
        for (let index = 0; index < this.itemsAmount; index++) {
            let random = this.uuid()
            result.push(
                JSON.parse(
                    productTemplate
                        .replaceAll('{random}', random)
                        .replaceAll('"{fkStoreDe}"', replacement.fkStoreDe)
                        .replaceAll('"{fkStoreAt}"', replacement.fkStoreAt)
                        .replaceAll('"{fkCategory}"', replacement.fkCategory)
                        .replaceAll('"{fkStock}"', replacement.fkStock)
                        .replaceAll('"{fkProductRelationType}"', replacement.fkProductRelationType)
                        .replaceAll('"{fkPriceType}"', replacement.fkPriceType)
                        .replaceAll('"{fkCurrency}"', replacement.fkCurrency)
                        .replaceAll('"{fkLocaleEn}"', replacement.fkLocaleEn)
                        .replaceAll('"{fkLocaleDe}"', replacement.fkLocaleDe)
                        .replaceAll('"{fkProductLabel}"', productLabelId)
                        .replaceAll('"{CONCRETES}"', this.getConcrete(productConcreteTemplate, random))
                )
            )
        }
        
        return JSON.stringify({
            data: result
        })
    }

    generateImageSet(productImageTemplate, productImageSetIdsMap) {
        let result = []
        for (const key of productImageSetIdsMap.keys()) {
            result.push(
                JSON.parse(
                    productImageTemplate
                        .replaceAll('"{fkProductImageSet}"', productImageSetIdsMap.get(key))
                        .replaceAll('{random}', key)
                )
            )
        }

        return JSON.stringify({
            data: result
        })
    }

    generateLabel(productLabelTemplate) {
        let result = []
        result.push(JSON.parse(productLabelTemplate.replaceAll('{random}', this.uuid()).replaceAll('"{fkStoreDe}"', replacement.fkStoreDe).replaceAll('"{fkStoreAt}"', replacement.fkStoreAt)))

        return JSON.stringify({
            data: result
        })
    }
}