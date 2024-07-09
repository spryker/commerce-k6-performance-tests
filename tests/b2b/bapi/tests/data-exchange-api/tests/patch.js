import { Profiler } from '../../../../../../helpers/profiler.js';
import {
    getExecutionConfiguration,
    getStoreWhiteList,
    loadDefaultOptions,
    useOnlyDefaultStoreLocale
} from '../../../../../../lib/utils.js';
import { ApiPatchPayloadScenario } from '../scenarios/api-patch-payload-scenario.js';

export const options = loadDefaultOptions();

let productTemplate = open('../template/product.json')
let productConcreteTemplate = open('../template/concrete.json')
let productLabelTemplate = open('../template/productLabel.json')

let profiler = new Profiler()

let executionConfig = getExecutionConfiguration(
    __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH,
    __ENV.DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE, 
    __ENV.DATA_EXCHANGE_THREADS_PATCH, 
    __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT
)

options.scenarios = {
    ProductCreatePatchVUS: {
        exec: 'productPatchScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-PATCH',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: '1200m'
    },
};

const productPatchCreateScenario = new ApiPatchPayloadScenario(
    __ENV.DATA_EXCHANGE_ENV,
    executionConfig.chunkSize,
    executionConfig.concreteMaxAmount,
    {},
    getStoreWhiteList(),
    useOnlyDefaultStoreLocale()
);

export function productPatchScenario() {
    productPatchCreateScenario.execute(productTemplate, productConcreteTemplate, productLabelTemplate, profiler);
}
