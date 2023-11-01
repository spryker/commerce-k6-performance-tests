import { CheckoutScenario } from "../../scenarios/checkout/checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI7_Checkout_1_item: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: __ENV.numberOfItems || '1'
        },
        tags: {
            testId: 'SAPI7',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const checkoutScenario = new CheckoutScenario('B2B');

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems);
}
