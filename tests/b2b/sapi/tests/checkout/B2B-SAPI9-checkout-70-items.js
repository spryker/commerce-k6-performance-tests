import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const checkoutScenario = new SharedCheckoutScenario('B2B');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI9_Checkout_70_items: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '70'
        },
        tags: {
            testId: 'SAPI9',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${checkoutScenario.getStorefrontApiBaseUrl()}/checkout?include=orders}`] = ['avg<811'];

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems, false);
}
