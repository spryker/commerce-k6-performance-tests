import { CheckoutScenario } from '../../scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const checkoutScenario = new CheckoutScenario('B2B');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI7_Checkout_1_item: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '1'
        },
        tags: {
            testId: 'SAPI7',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${checkoutScenario.getStorefrontApiBaseUrl()}/checkout?include=orders}`] = ['avg<1145'];

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems);
}
