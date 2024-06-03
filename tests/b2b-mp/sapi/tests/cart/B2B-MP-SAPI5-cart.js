import { SharedCartScenario } from '../../../../cross-product/sapi/scenarios/cart/shared-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI5';

const sharedCartScenario = new SharedCartScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI5_Cart: {
        exec: 'executeSharedCartScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '1'
        },
        tags: {
            testId: testId,
            testGroup: 'Cart',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${sharedCartScenario.getStorefrontApiBaseUrl()}/carts/\${}/?include=items}`] = ['avg<383'];

export function executeSharedCartScenario() {
    sharedCartScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
