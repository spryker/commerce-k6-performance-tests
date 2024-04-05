import { SharedCheckoutScenario } from '../../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
    S4_Checkout_70_items: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '70'
        },
        tags: {
            testId: 'S4',
            testGroup: 'Checkout',
        },
        iterations: 10,
    },
};

const checkoutScenario = new SharedCheckoutScenario('B2B');

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}
