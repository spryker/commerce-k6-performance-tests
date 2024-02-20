
import { group } from 'k6';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { uuid } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';
import { ApiPostPayloadScenario } from './api-post-payload-scenario.js';

export class ApiPatchPayloadScenario extends ApiPostPayloadScenario {
    constructor(environment, chunkSize, options = {}) {
        super(environment, options, options)
        this.chunkSize =chunkSize
        this.sleepInterval = 30
        this.retryLimit = 2
        this.payloadGenerator = new DataExchangePayloadGenerator(uuid, this.chunkSize)
        this.group = 'API PATCH'
        this.type = 'patch'
    }

    execute(productTemplate, productLabelTemplate) {
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
            let updateResult
            do {
                updateResult = self.updateProducts(responseProducts, requestParams)
                count++
                if (updateResult.status !== 201) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    console.warn(`Start sleeping because of request for products ${self.type} failed. Retry: ${count}, timeout: ${sleepingInterval} sec`)
                    sleep(sleepingInterval)
                    console.warn(`Sleeping done. Iteration: ${count}`)
                }
                if (count > self.retryLimit) {
                    console.error(`Request for products ${self.type}: was not able to process request within ${count} iterations`)
                    break;
                }
            } while (updateResult.status !== 201 && count < self.retryLimit)
            
        });
    }

    updateProducts(responseProducts, requestParams) {
        let recentlyCreatedProducts =  JSON.parse(responseProducts.body).data
        console.log('thread:', __VU, 'iteration:', __ITER, new Date().toLocaleString())
        let payloadProducts = this.payloadGenerator.prepareProductsForUpdate(recentlyCreatedProducts)
        // console.log('payloadProducts', payloadProducts)
        let updateResult = this.http.sendPatchRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`, payloadProducts, requestParams, false);
        // console.log('patchResult', updateResult)
        console.log('thread:', __VU, 'iteration:', __ITER, 'updateResult', updateResult.status, new Date().toLocaleString())

        return updateResult
    }
}
