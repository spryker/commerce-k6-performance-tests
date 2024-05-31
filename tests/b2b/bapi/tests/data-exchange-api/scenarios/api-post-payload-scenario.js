
import { group } from 'k6';
import { AbstractScenario } from '../../../../../abstract-scenario.js';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { debug, getIteration, getThread, uuid } from '../../../../../../lib/utils.js';
import { sleep } from 'k6';
import { Profiler } from '../../../../../../helpers/profiler.js';
import { Trend, Counter } from 'k6/metrics';
import ConfigHandler from '../../../../../../helpers/dynamicEntity/handler/configHandler.js';
import StockHandler from '../../../../../../helpers/dynamicEntity/handler/stockHandler.js';

export class ApiPostPayloadScenario extends AbstractScenario {
    constructor(environment, chunkSize, concreteMaxAmount, options = {}, storeWhitelist = []) {
        super(environment, options)
        this.chunkSize = chunkSize
        this.concreteMaxAmount = concreteMaxAmount
        this.sleepInterval = 30
        this.retryLimit = 10
        this.group = 'API POST'
        this.type = 'post'
        this.payloadGenerator = new DataExchangePayloadGenerator(uuid, new ConfigHandler(this.http, this.urlHelper, this.bapiHelper, storeWhitelist), new StockHandler(this.http, this.urlHelper, this.bapiHelper, storeWhitelist), this.chunkSize, this.concreteMaxAmount)
        this.profiler = new Profiler()
        this.tokenTrend = new Trend('token_generation', true)
        this.productLabelCreationTrend = new Trend('product_label_creation', true)
        this.productCreateTrend = new Trend('product_creation', true)
        this.productImageCreationTrend = new Trend('product_image_creation', true)
        this.productCreationTotal = new Counter('product_creation_total', true)
        this.sleepingTimeTotal = new Counter('sleeping_time_total', true)
        this.productImageCreationTotal = new Counter('product_image_creation_total', true)
        this.productLabelId = null
    }

    execute(productTemplate, productConcreteTemplate, productImageTemplate, productLabelTemplate) {
        let self = this;
        group(self.group, function () {
            const requestParams = self.getRequestParams()
            let responseProducts = self.createProductsWithLabels(requestParams, productTemplate, productConcreteTemplate, productLabelTemplate)
            self.payloadGenerator.generateProducts(productTemplate, productConcreteTemplate)
            let count = 0
            let productImageResponse
            do {
                productImageResponse = self.createProductsImages(productImageTemplate, responseProducts, requestParams)
                count++
                if (productImageResponse.status !== 201) {
                    let sleepingInterval = self.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                    self.sleepingTimeTotal.add(sleepingInterval * 1000)
                    console.warn(`Start sleeping because of request for images creation failed. Response status: ${productImageResponse.status}. Amount Of Retries: ${count}, timeout: ${sleepingInterval} sec`)
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

    createProductsWithLabels(requestParams, productTemplate, productConcreteTemplate, productLabelTemplate) {
        let count = 0
        this.profiler.start('labelIdGeneration')
        let productLabelId = this.getLabels(productLabelTemplate, requestParams)

        if (!productLabelId) {
            console.warn('Sleeping because of request for labels creation failed')
            sleep(this.sleepInterval)
            productLabelId = this.getLabels(productLabelTemplate, requestParams)
        }
        this.profiler.start('productCreation')
        let responseProducts
        do {
            responseProducts = this.createProducts(productTemplate, productConcreteTemplate, productLabelId, requestParams)
            count++
            if (responseProducts.status !== 201) {
                let sleepingInterval = this.sleepInterval * count + Math.floor(Math.random() * 10) + 1
                this.sleepingTimeTotal.add(sleepingInterval * 1000)
                console.warn(`Start sleeping because of request for products ${this.type} failed. Response status: ${responseProducts.status}. Amount Of Retries: ${count}, timeout: ${sleepingInterval} sec. thread:${getThread()}, iteration: ${getIteration()}`)
                sleep(sleepingInterval)
                console.warn(`Sleeping done. Iteration: ${count}. thread:${getThread()}, iteration: ${getIteration()}`)
            }
            if (count > this.retryLimit) {
                console.error(`Request for products ${this.type}: was not able to process request within ${count} iterations. thread:${getThread()}, iteration: ${getIteration()}`)
                break;
            }
        } while (responseProducts.status !== 201 && count < this.retryLimit)

        return responseProducts
    }

    getRequestParams() {
        this.profiler.start('authorization')
        const requestParams = this.bapiHelper.getParamsWithAuthorization();
        this.tokenTrend.add(this.profiler.stop('authorization'))
        requestParams.thresholds = {}
        requestParams.timeout = '180s'
        debug('Authorization params:', requestParams)
        this.authParams = requestParams

        return this.authParams
    }

    getLabels(productLabelTemplate, requestParams) {
        if (this.productLabelId === null) {
            debug('thread:', getThread(), 'iteration:', getIteration(), new Date().toLocaleString())
            let payloadLabels = this.payloadGenerator.generateLabel(productLabelTemplate)
            let productLabelIds = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-labels`, payloadLabels, requestParams, false);
            if (productLabelIds.status === 201) {
                this.productLabelCreationTrend.add(productLabelIds.timings.duration)
            }
            
            let labels = JSON.parse(productLabelIds.body).data
            let productLabelId = null
            if (Array.isArray(labels)) {
                productLabelId = JSON.parse(productLabelIds.body).data[0].id_product_label
            }
            debug('thread:', getThread(), 'iteration:', getIteration(), 'productLabelIds', productLabelIds, 'productLabelIds.status', productLabelIds.status, new Date().toLocaleString(), 'productLabelId', productLabelId)
            this.productLabelId = productLabelId
        }
        
        return this.productLabelId
    }

    createProducts(productTemplate, productConcreteTemplate, productLabelId, requestParams) {
        debug('thread:', getThread(), 'iteration:', getIteration(), new Date().toLocaleString())

        let payloadProducts = this.payloadGenerator.generateProducts(productTemplate, productConcreteTemplate, productLabelId)
        let responseProducts = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`, payloadProducts, requestParams, false);
        
        debug('responseProducts', responseProducts)
        debug('thread:', getThread(), 'iteration:', getIteration(), 'responseProducts.status', responseProducts.status, new Date().toLocaleString())
        
        if (responseProducts.status === 201) {
            this.productCreationTotal.add(responseProducts.timings.duration)
            this.productCreateTrend.add(responseProducts.timings.duration)
        }

        return responseProducts
    }

    createProductsImages(productImageTemplate, responseProducts, requestParams) {
        debug('thread:', getThread(), 'iteration:', getIteration(), new Date().toLocaleString())
        let productImageSetIdsMap = new Map()
        let response = JSON.parse(responseProducts.body).data
        response = Array.isArray(response) ? response : []
        response.map((el) => {
            el.productAbstractImageSets.map((imgSet) => {
                productImageSetIdsMap.set(imgSet.name, imgSet.id_product_image_set)
            })
        })

        let payloadImageSet = this.payloadGenerator.generateImageSet(productImageTemplate, productImageSetIdsMap)
        let responseImageSet = this.http.sendPostRequest(this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-images`, payloadImageSet, requestParams, false);
        debug('thread:', getThread(), 'iteration:', getIteration(), 'responseImageSet', responseImageSet.status, responseImageSet, new Date().toLocaleString())
        
        if (responseImageSet.status === 201) {
            this.productImageCreationTotal.add(responseImageSet.timings.duration)
            this.productImageCreationTrend.add(responseImageSet.timings.duration)
        }
        
        return responseImageSet
    }
}
