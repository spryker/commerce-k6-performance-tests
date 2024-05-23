import { ApiPostPayloadScenario } from '../scenarios/api-post-payload-scenario.js';
import { getExecutionConfiguration, getStoreWhiteList, loadDefaultOptions } from '../../../../../../lib/utils.js';

export const options = loadDefaultOptions();


let productTemplate = open(`../template/product.json`)
let productConcreteTemplate = open(`../template/concrete.json`)
let productLabelTemplate = open(`../template/productLabel.json`)
let productImageTemplate = open(`../template/productImage.json`)

let executionConfig = getExecutionConfiguration(
    __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST, 
    __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE, 
    __ENV.DATA_EXCHANGE_THREADS_POST, 
    __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT
)

options.scenarios = {
    ProductCreatePostVUS: {
        exec: 'productPostScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-POST',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: '1200m'
    },
};

console.log('getStoreWhiteList()', getStoreWhiteList())
const productCreateScenario = new ApiPostPayloadScenario(__ENV.DATA_EXCHANGE_ENV, executionConfig.chunkSize, executionConfig.concreteMaxAmount, {}, getStoreWhiteList());
export function productPostScenario() {
    productCreateScenario.execute(productTemplate, productConcreteTemplate, productImageTemplate, productLabelTemplate);
}
