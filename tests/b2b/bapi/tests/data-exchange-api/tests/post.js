import { ApiPostPayloadScenario } from '../scenarios/api-post-payload-scenario.js';
import {
    useOnlyDefaultStoreLocale,
    getExecutionConfiguration,
    getStoreWhiteList,
    loadDefaultOptions
} from '../../../../../../lib/utils.js';

export const options = loadDefaultOptions();

let productTemplate = open('../template/product.json')
let productConcreteTemplate = open('../template/concrete.json')
let productLabelTemplate = open('../template/productLabel.json')
let productImageTemplate = open('../template/productImage.json')

let executionConfig = getExecutionConfiguration(
    __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST,
    __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE,
    __ENV.DATA_EXCHANGE_THREADS_POST,
    __ENV.DATA_EXCHANGE_ENV,
    __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT,
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

console.info('Product creation limited for stores (when empty - all available stores will be used): ', getStoreWhiteList(), useOnlyDefaultStoreLocale())
const productCreateScenario = new ApiPostPayloadScenario(
    executionConfig.targetEnv,
    executionConfig.chunkSize,
    executionConfig.concreteMaxAmount,
    {},
    getStoreWhiteList(),
    useOnlyDefaultStoreLocale(),
    __ENV.DATA_EXCHANGE_ACTIVATE_PRODUCTS
);

export function productPostScenario() {
    productCreateScenario.execute(productTemplate, productConcreteTemplate, productImageTemplate, productLabelTemplate);
}

//
// export function handleSummary(data) {
//     console.log('Preparing the end-of-test summary...');
//
//     return {
//         'junit.xml': jUnit(data), // Transform summary and save it as a JUnit XML...
//     };
// }