import exec from 'k6/execution';
import {
    getExecutionConfiguration,
    getStoreWhiteList,
    loadDefaultOptions,
    useOnlyDefaultStoreLocale
} from '../../../../../../lib/utils.js';
import {ApiPatchStockPayloadScenario} from '../scenarios/api-patch-stock-scenario.js';
import read from 'k6/x/read';

export const options = loadDefaultOptions();

let products = JSON.parse(read.readFile('tests/dex/tests/data/products_for_update.json').content)

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
            testId: 'DX-PATCH-STOCK',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: '1200m'
    },
};

const productPatchStockScenario = new ApiPatchStockPayloadScenario(
    __ENV.DATA_EXCHANGE_ENV,
    executionConfig.chunkSize,
    executionConfig.concreteMaxAmount,
    {},
    getStoreWhiteList(),
    useOnlyDefaultStoreLocale()
);

export function productPatchScenario() {
    let offset = exec.scenario.iterationInInstance * executionConfig.chunkSize
    const batch = products.slice(offset, offset + executionConfig.chunkSize);
    productPatchStockScenario.execute(batch);
}