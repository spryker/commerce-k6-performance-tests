
import { group } from 'k6';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { debug, uuid } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { ApiPostPayloadScenario } from './api-post-payload-scenario.js';

export class ApiPatchPayloadScenario extends ApiPostPayloadScenario {
    constructor(environment, chunkSize, concreteMaxAmount, options = {}) {
        super(environment, options, concreteMaxAmount, options)
        this.chunkSize =chunkSize
        this.sleepInterval = 30
        this.retryLimit = 2
        this.payloadGenerator = new DataExchangePayloadGenerator(uuid, this.chunkSize)
        this.group = 'API PATCH'
        this.type = 'patch'
        this.productPatchTrend = new Trend('product_patch', true)
        this.productPatchTotal = new Counter('product_patch_total', true)
    }

    execute(productTemplate, productConcreteTemplate, productLabelTemplate) {
        let self = this;
        group(self.group, function () {
            const requestParams = self.getRequestParams()
            let responseProducts = self.createProductsWithLabels(requestParams, productTemplate, productConcreteTemplate, productLabelTemplate)
            let count = 0
            let updateResult
            do {
                updateResult = self.updateProducts(responseProducts, requestParams)
                count++
                if (updateResult.status !== 200) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    console.warn(`Start sleeping because of request for products ${self.type} failed. Response status: ${updateResult.status}. Amount Of Retries: ${count}, timeout: ${sleepingInterval} sec. thread:${ __VU}, iteration: ${__ITER}`)
                    sleep(sleepingInterval)
                    console.warn(`Sleeping done. Iteration: ${count}. thread:${ __VU}, iteration: ${__ITER}`)
                }
                if (count > self.retryLimit) {
                    console.error(`Request for products ${self.type}: was not able to process request within ${count} iterations. thread:${ __VU}, iteration: ${__ITER}`)
                    break;
                }
            } while (updateResult.status !== 200 && count < self.retryLimit)
        });
    }

    updateProducts(responseProducts, requestParams) {
        let recentlyCreatedProducts =  JSON.parse(responseProducts.body).data
        let payloadProducts = this.payloadGenerator.prepareProductsForUpdate(recentlyCreatedProducts)
        let updateResult = this.http.sendPatchRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`, payloadProducts, requestParams, false);
        debug(updateResult)
        if (updateResult.status === 200) {
            this.productPatchTotal.add(updateResult.timings.duration)
            this.productPatchTrend.add(updateResult.timings.duration)
        }
        return updateResult
    }
}
