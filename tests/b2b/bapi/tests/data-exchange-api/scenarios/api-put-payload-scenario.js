
import { group } from 'k6';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { getIteration, getThread, uuid } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { ApiPostPayloadScenario } from './api-post-payload-scenario.js';

export class ApiPutPayloadScenario extends ApiPostPayloadScenario {
  constructor(environment, chunkSize, concreteMaxAmount, options = {}) {
    super(environment, options, concreteMaxAmount, options)
    this.chunkSize = chunkSize
    this.sleepInterval = 30
    this.retryLimit = 2
    this.payloadGenerator = new DataExchangePayloadGenerator(uuid, this.chunkSize)
    this.group = 'API PUT'
    this.type = 'put'
    this.productPutTrend = new Trend('product_put', true)
    this.productPutTotal = new Counter('product_put_total', true)
    this.productInitTotal = new Counter('product_initialization', false)
    this.responseProducts = null
  }

  execute(productTemplate, productConcreteTemplate, productLabelTemplate) {
    let self = this;
    group(self.group, function () {
      const requestParams = self.getRequestParams()
      if (self.responseProducts === null) {
        self.productInitTotal.add(1)
        self.responseProducts = self.createProductsWithLabels(requestParams, productTemplate, productConcreteTemplate, productLabelTemplate)
      }
            
      let count = 0
      self.profiler.start('productPut')
      let updateResult
      do {
        updateResult = self.updateProducts(self.responseProducts, requestParams)
        count++
        if (updateResult.status !== 200) {
          let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
          self.sleepingTimeTotal.add(sleepingInterval)
          console.warn(`Start sleeping because of request for products ${self.type} failed. Response status: ${updateResult.status}. Amount Of Tries: ${count}, timeout: ${sleepingInterval} sec. thread:${getThread()}, iteration: ${getIteration()}`)
          sleep(sleepingInterval)
          console.warn(`Sleeping done. thread:${getThread()}, iteration: ${getIteration()}`)
        }
        if (count > self.retryLimit) {
          console.error(`Request for products ${self.type}: was not able to process request within ${count} tries, thread:${getThread()}, iteration: ${getIteration()}`)
          break;
        }
      } while (updateResult.status !== 200 && count < self.retryLimit)
      self.productPutTrend.add(self.profiler.stop('productPut'))
    });
  }

  updateProducts(responseProducts, requestParams) {
    let recentlyCreatedProducts = JSON.parse(responseProducts.body).data
    let payloadProducts = this.payloadGenerator.prepareProductsForUpdate(recentlyCreatedProducts)
    let updateResult = this.http.sendPutRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`, payloadProducts, requestParams, false);
    if (updateResult.status === 200) {
      this.productPutTotal.add(updateResult.timings.duration)
    }
        
    return updateResult
  }
}
