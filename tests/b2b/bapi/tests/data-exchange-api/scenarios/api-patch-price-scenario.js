
import { debug } from '../../../../../../lib/utils.js';
import { Trend, Counter } from 'k6/metrics';
import {ApiPatchAbstractPayloadScenario} from './api-patch-payload-scenario.js';

export class ApiPatchPricePayloadScenario extends ApiPatchAbstractPayloadScenario {
    constructor(environment, chunkSize, concreteMaxAmount, options = {}, storeWhitelist = [], useDefaultStoreLocale = false) {
        super(environment, chunkSize, concreteMaxAmount, options, storeWhitelist, useDefaultStoreLocale)
        this.group = 'API PATCH PRICE'
        this.productPatchPriceTrend = new Trend('product_patch_price', true)
        this.productPatchPriceTotal = new Counter('product_patch_price_total', true)
        this.productInitTotal = new Counter('product_initialization', false)
        this.productsTotal = new Counter('product_counter', false)
    }

    updateProducts(productsForUpdate, requestParams) {
        let payloadProducts = this.payloadGenerator.prepareProductPricesPatchPayload(productsForUpdate)
        let patchResult = this.http.sendPatchRequest(
            this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`,
            payloadProducts,
            requestParams,
            false
        );

        debug(patchResult)

        if (patchResult.status === 200) {
            this.productPatchPriceTotal.add(patchResult.timings.duration)
            this.productsTotal.add(productsForUpdate.length)
            this.productPatchPriceTrend.add(patchResult.timings.duration)
        } else {
            console.error([... new Set(...[JSON.parse(patchResult.body).map(el => el.message)])])
        }

        return patchResult
    }
}
