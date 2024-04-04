import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

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

const checkoutScenario = new SharedCheckoutScenario('B2B_MP');

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems);
}
