import { getExecutionConfiguration, getStoreWhiteList, loadDefaultOptions } from '../../../../../../lib/utils.js';
import { ApiPutPayloadScenario } from '../scenarios/api-put-payload-scenario.js';

export const options = loadDefaultOptions();

let executionConfig = getExecutionConfiguration(
    __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH, 
    __ENV.DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE,
    __ENV.DATA_EXCHANGE_THREADS_PUT, 
    __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT
)

let productTemplate = open('../template/product.json')
let productConcreteTemplate = open('../template/concrete.json')
let productLabelTemplate = open('../template/productLabel.json')

options.scenarios = {
    ProductPutVUS: {
        exec: 'productPutScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-PUT',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: '1200m'
    },
};

const productPutCreateScenario = new ApiPutPayloadScenario(__ENV.DATA_EXCHANGE_ENV, executionConfig.chunkSize, executionConfig.concreteMaxAmount,{}, getStoreWhiteList());

export function productPutScenario() {
    productPutCreateScenario.execute(productTemplate, productConcreteTemplate, productLabelTemplate);
}