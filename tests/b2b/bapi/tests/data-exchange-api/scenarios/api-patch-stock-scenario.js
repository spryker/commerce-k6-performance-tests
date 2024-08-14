
import { debug } from '../../../../../../lib/utils.js';
import { Trend, Counter } from 'k6/metrics';
import {ApiPatchAbstractPayloadScenario} from './api-patch-payload-scenario.js';

export class ApiPatchStockPayloadScenario extends ApiPatchAbstractPayloadScenario {
    constructor(environment, chunkSize, concreteMaxAmount, options = {}, storeWhitelist = [], useDefaultStoreLocale = false) {
        super(environment, chunkSize, concreteMaxAmount, options, storeWhitelist, useDefaultStoreLocale)
        this.group = 'API PATCH STOCK'
        this.productPatchStockTrend = new Trend('product_patch_stock', true)
        this.productPatchStockTotal = new Counter('product_patch_stock_total', true)
        this.productInitTotal = new Counter('product_initialization', false)
        this.productsTotal = new Counter('product_counter', false)
    }

    updateProducts(productsForUpdate, requestParams) {
        let payloadProducts = this.payloadGenerator.prepareProductStockPatchPayload(productsForUpdate)
        let patchResult = this.http.sendPatchRequest(
            this.http.url`${this.getBackendApiUrl()}/dynamic-entity/product-abstracts`,
            payloadProducts,
            requestParams,
            false
        );

        debug(patchResult)

        if (patchResult.status === 200) {
            this.productPatchStockTotal.add(patchResult.timings.duration)
            this.productsTotal.add(productsForUpdate.length)
            this.productPatchStockTrend.add(patchResult.timings.duration)
        }

        return patchResult
    }
}
