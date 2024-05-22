import { loadDefaultOptions } from '../../../../../../lib/utils.js';
import { ApiGetScenario } from '../scenarios/api-get-payload-scenario.js';

export const options = loadDefaultOptions();

options.scenarios = {
    ProductGetVUS: {
        exec: 'productGetScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-GET',
            testGroup: 'DataExchange',
        },
        iterations: 10,
        vus: __ENV.DATA_EXCHANGE_THREADS,
    },
};

const productGetCreateScenario = new ApiGetScenario(__ENV.DATA_EXCHANGE_ENV);

export function productGetScenario() {
    productGetCreateScenario.execute();
}
