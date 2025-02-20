
import { group } from 'k6';
import {debug, getIteration, getThread} from '../../../../../../lib/utils.js';
import { Trend } from 'k6/metrics';
import { AbstractScenario } from '../../../../../abstract-scenario.js';
import { Profiler } from '../../../../../../helpers/profiler.js';

export class ApiGetScenario extends AbstractScenario {
    constructor(environment, limit, amountOfThreads, iterations, catalogSizeForProcessing, options = {}) {
        super(environment, options)
        this.limit = limit;
        this.amountOfThreads = amountOfThreads;
        this.iterations = iterations;
        this.catalogSizeForProcessing = catalogSizeForProcessing;
        this.sleepInterval = 30
        this.retryLimit = 2
        this.group = 'API GET'
        this.profiler = new Profiler()
        this.type = 'get'
        this.counter = 0
        this.offset = 0;
        this.productGetTrend = new Trend('product_get', true)
        this.tokenTrend = new Trend('token_generation', true)

    }

    getRequestConfiguration() {
        this.counter++;
        if (!this.offset) {
            this.offset = (getThread() - 1) * this.limit
        }
        if (this.counter > 1) {
            this.offset += this.amountOfThreads * this.limit
        }
        return {
            pageLimit: this.limit,
            offset: this.offset,
            skip: this.offset >= this.catalogSizeForProcessing
        }
    }

    getRequestParams() {
        this.profiler.start('authorization')
        const requestParams = this.bapiHelper.getParamsWithAuthorization();
        this.tokenTrend.add(this.profiler.stop('authorization'))
        requestParams.thresholds = {}
        requestParams.timeout = '180s'
        delete(requestParams.headers['Content-Type'])
        requestParams.headers['accept'] = 'application/json'
        debug('Authorisation params:', requestParams)

        return requestParams
    }

    execute() {
        let self = this;
        group(self.group, function () {
            const requestConfig = self.getRequestConfiguration()
            if (requestConfig.skip) {
                return;
            }
            console.log('requestConfig', requestConfig);
            const requestParams = self.getRequestParams()
            let responseProducts = self.http.sendGetRequest(self.http.url`${self.getBackendApiUrl()}/dynamic-entity/product-abstracts?include=productAbstractStores,productAbstractProducts,productRelations,productAbstractPriceProducts,productAbstractCategories,productAbstractLocalizedAttributes,productAbstractsProductLabel,productAbstractImageSets&page[offset]=${requestConfig.offset}&page[limit]=${requestConfig.pageLimit}`, requestParams, false);
            // let responseProducts = self.http.sendGetRequest(self.http.url`${self.getBackendApiUrl()}/dynamic-entity/product-abstracts?page[offset]=${requestConfig.offset}&page[limit]=${requestConfig.pageLimit}`, requestParams, false);
            if (responseProducts.status === 200) {
                self.productGetTrend.add(responseProducts.timings.duration)
            }
            self.assertionsHelper.assertResponseStatus(responseProducts, 200);
        });
    }
}
