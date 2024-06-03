import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI9';

const checkoutScenario = new SharedCheckoutScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI9_Checkout_70_items: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '70'
        },
        tags: {
            testId: testId,
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${checkoutScenario.getStorefrontApiBaseUrl()}/checkout?include=orders}`] = ['avg<988'];

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems);
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
