

export class DataExchangePayloadGenerator {
    itemsAmount

    constructor(uuid, itemsAmount = 1000) {
        this.itemsAmount = itemsAmount
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
                    price: Math.round(Math.random() * 100)
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
                                    key[thirdLevelKey] = secondLevel[secondLevelKey][thirdLevelKey]
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

    generateProducts(productTemplate, productLabelId = 3) {
        let result = []
        for (let index = 0; index < this.itemsAmount; index++) {
            result.push(
                JSON.parse(
                    productTemplate
                        .replaceAll('{random}', this.uuid())
                        .replaceAll('"{fkStore}"', 1)
                        .replaceAll('"{fkCategory}"', 1)
                        .replaceAll('"{fkStock}"', 1)
                        .replaceAll('"{fkProductRelationType}"', 1)
                        .replaceAll('"{fkPriceType}"', 1)
                        .replaceAll('"{fkCurrency}"', 1)
                        .replaceAll('"{fkLocale}"', 1)
                        .replaceAll('"{fkProductLabel}"', productLabelId)
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
        result.push(JSON.parse(productLabelTemplate.replaceAll('{random}', this.uuid()).replaceAll('"{fkStore}"', 1)))

        return JSON.stringify({
            data: result
        })
    }
}