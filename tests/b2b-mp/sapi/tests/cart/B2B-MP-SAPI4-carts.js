import { SharedCartsScenario } from '../../../../cross-product/sapi/scenarios/cart/shared-carts-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI4';

const sharedCartsScenario = new SharedCartsScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI4_Carts: {
        exec: 'executeCartsScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'Cart',
        },
        iterations: 10
    },
};
options.thresholds['http_req_duration{request_name:sapi_get_carts}'] = ['avg<293'];

export function executeCartsScenario() {
    sharedCartsScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
