
import { group } from 'k6';
import { AbstractScenario } from '../../../../../abstract-scenario.js';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { debug, uuid } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';

export class ApiPostPayloadScenario extends AbstractScenario {
    constructor(environment, chunkSize, options = {}) {
        super(environment, options)
        this.chunkSize =chunkSize
        this.sleepInterval = 30
        this.retryLimit = 10
        this.group = 'API POST'
        this.type = 'post'
        this.payloadGenerator = new DataExchangePayloadGenerator(uuid, this.chunkSize)
    }

    execute(productTemplate, productImageTemplate, productLabelTemplate) {
        let self = this;
        group(self.group, function () {
            const requestParams = self.bapiHelper.getParamsWithAuthorization();
            requestParams.thresholds = {}
            requestParams.timeout = '180s'
            let count = 0

            let productLabelId = self.getLabels(productLabelTemplate, requestParams)
            if (!productLabelId) {
                console.warn("Sleeping because of request for labels creation failed")
                sleep(self.sleepInterval)
                productLabelId = self.getLabels(productLabelTemplate, requestParams)
            }
            let responseProducts
            do {
                responseProducts = self.createProducts(productTemplate, productLabelId, requestParams)
                count++
                if (responseProducts.status !== 201) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    console.warn(`Start sleeping because of request for products ${self.type} failed. Retry: ${count}, timeout: ${sleepingInterval} sec`)
                    sleep(sleepingInterval)
                    console.warn(`Sleeping done. Iteration: ${count}`)
                }
                if (count > self.retryLimit) {
                    console.error(`Request for products ${self.type}: was not able to process request within ${count} iterations`)
                    break;
                }
            } while (responseProducts.status !== 201 && count < self.retryLimit)
            
            count = 0
            let productImageResponse 
            do {
                productImageResponse = self.createProductsImages(productImageTemplate, responseProducts, requestParams)
                count++
                if (productImageResponse.status !== 201) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    console.warn(`Start sleeping because of request for images creation failed. Retry: ${count}, timeout: ${sleepingInterval} sec`)
                    sleep(sleepingInterval)
                    console.warn(`Sleeping done. Iteration: ${count}`)
                }
                if (count > self.retryLimit) {
                    console.error(`Request for images ${self.type}: was not able to process request within ${count} iterations`)
                    break;
                }
            } while (productImageResponse.status !== 201 && count < self.retryLimit)
            count = 0
        });
    }

    getLabels(productLabelTemplate, requestParams) {
        debug('thread:', __VU, 'iteration:', __ITER, new Date().toLocaleString())
        let payloadLabels = this.payloadGenerator.generateLabel(productLabelTemplate)
        
        let productLabelIds = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-labels`, payloadLabels, requestParams, false);
        let productLabelId = JSON.parse(productLabelIds.body).data[0].id_product_label
        debug('thread:', __VU, 'iteration:', __ITER, 'productLabelIds', productLabelIds.status, new Date().toLocaleString())

        return productLabelId
    }

    createProducts(productTemplate, productLabelId, requestParams) {
        debug('thread:', __VU, 'iteration:', __ITER, new Date().toLocaleString())
        let payloadProducts = this.payloadGenerator.generateProducts(productTemplate, productLabelId)
        let responseProducts = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`, payloadProducts, requestParams, false);
        debug('thread:', __VU, 'iteration:', __ITER, 'responseProducts', responseProducts.status, new Date().toLocaleString())

        return responseProducts
    }

    createProductsImages(productImageTemplate, responseProducts, requestParams) {
        debug('thread:', __VU, 'iteration:', __ITER, new Date().toLocaleString())
        let productImageSetIdsMap = new Map()
        let response = JSON.parse(responseProducts.body).data
        response = Array.isArray(response) ? response : []
        response.map((el) => {
            el.productImageSets.map((imgSet) => {
                productImageSetIdsMap.set(imgSet.name, imgSet.id_product_image_set)
            })
        })

        let payloadImageSet = this.payloadGenerator.generateImageSet(productImageTemplate, productImageSetIdsMap)
        let responseImageSet = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-images`, payloadImageSet, requestParams, false);
        debug('thread:', __VU, 'iteration:', __ITER, 'responseImageSet', responseImageSet.status, new Date().toLocaleString())
        return responseImageSet
    }
}
