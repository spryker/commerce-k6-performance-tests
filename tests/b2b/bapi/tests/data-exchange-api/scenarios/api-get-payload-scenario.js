
import { group } from 'k6';
import { DataExchangePayloadGenerator } from '../../../../../../helpers/data-exchange-payload-generator.js';
import { debug, uuid } from '../../../../../../lib/utils.js';
import { Trend, Counter } from 'k6/metrics';
import { AbstractScenario } from '../../../../../abstract-scenario.js';
import { Profiler } from '../../../../../../helpers/profiler.js';


export class ApiGetScenario extends AbstractScenario {
    constructor(environment, options = {}) {
        super(environment, options)
        this.sleepInterval = 30
        this.retryLimit = 2
        this.payloadGenerator = new DataExchangePayloadGenerator(uuid, this.chunkSize)
        this.group = 'API GET'
        this.profiler = new Profiler()
        this.type = 'get'
        this.productGetTrend = new Trend('product_get', true)
        this.tokenTrend = new Trend('token_generation', true)
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
            const requestParams = self.getRequestParams()
            let responseProducts = self.http.sendGetRequest(self.http.url`${self.getBackendApiUrl()}/dynamic-entity/product-abstracts?include=productAbstractStores,productAbstractProducts,productRelations,productAbstractPriceProducts,productAbstractCategories,productAbstractLocalizedAttributes,productLabelProductAbstracts,productImageSets&page[offset]=0&page[limit]=100`, requestParams, false);
            if (responseProducts.status === 200) {
                self.productGetTrend.add(responseProducts.timings.duration)
            }
            self.assertionsHelper.assertResponseStatus(responseProducts, 200);
        });
    }
}
