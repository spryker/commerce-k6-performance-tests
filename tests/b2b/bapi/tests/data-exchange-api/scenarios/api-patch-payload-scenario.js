
import { group } from 'k6';
import { getIteration, getThread } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { ApiPostPayloadScenario } from './api-post-payload-scenario.js';

export class ApiPatchAbstractPayloadScenario extends ApiPostPayloadScenario {
    constructor(environment, chunkSize, concreteMaxAmount, options = {}, storeWhitelist = [], useDefaultStoreLocale = false) {
        super(environment, chunkSize, concreteMaxAmount, options, storeWhitelist, useDefaultStoreLocale)
        this.chunkSize = chunkSize
        this.sleepInterval = 30
        this.retryLimit = 2
        this.group = 'API PATCH'
        this.type = 'patch'
        this.productInitTotal = new Counter('product_initialization', false)
        this.responseProducts = null
    }

    execute(productsForUpdate) {
        let self = this;
        group(self.group, function () {
            const requestParams = self.getRequestParams()

            let count = 0
            let updateResult
            do {
                updateResult = self.updateProducts(productsForUpdate, requestParams)
                count++
                if (updateResult.status !== 200) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    self.sleepingTimeTotal.add(sleepingInterval * 1000)
                    // eslint-disable-next-line max-len
                    console.warn(`Start sleeping because of request for products ${self.type} failed. Response status: ${updateResult.status}. Amount Of Tries: ${count}, timeout: ${sleepingInterval} sec. thread:${getThread()}, iteration: ${getIteration()}`)
                    sleep(sleepingInterval)
                    console.warn(`Sleeping done. thread:${getThread()}, iteration: ${getIteration()}`)
                }
                if (count > self.retryLimit) {
                    console.error(`Request for products ${self.type}: was not able to process request within ${count} tries, thread:${getThread()}, iteration: ${getIteration()}`)
                    break;
                }
            } while (updateResult.status !== 200 && count < self.retryLimit)
        });
    }

    // eslint-disable-next-line no-unused-vars
    updateProducts(productsForUpdate, requestParams) {
        throw Error('Method must be implemented')
    }
}
