import { loadDefaultOptions } from '../../../../../../lib/utils.js';
import { ApiGetScenario } from '../scenarios/api-get-payload-scenario.js';

export const options = loadDefaultOptions();
let amountOfThreads = parseInt(__ENV.DATA_EXCHANGE_THREADS_GET)
let catalogSizeForProcessing = parseInt(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST)
let limit = 1000

let potentialThreads = catalogSizeForProcessing / limit;

let volumePerThread = catalogSizeForProcessing / amountOfThreads;
let iterations = Math.ceil(volumePerThread / limit);

if (amountOfThreads > potentialThreads) {
    amountOfThreads = potentialThreads;
}
if (iterations < amountOfThreads) {
    amountOfThreads = iterations
}

options.scenarios = {
    ProductGetVUS: {
        exec: 'productGetScenario',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'DX-GET',
            testGroup: 'DataExchange',
        },
        iterations: iterations,
        vus: amountOfThreads,
    },
};

const productGetCreateScenario = new ApiGetScenario(__ENV.DATA_EXCHANGE_ENV, limit, amountOfThreads, iterations, catalogSizeForProcessing);

export function productGetScenario() {
    productGetCreateScenario.execute();
}
