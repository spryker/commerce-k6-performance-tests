import { CheckoutScenario } from "../../scenarios/checkout/checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    S8_Checkout_300_items: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: __ENV.numberOfItems || '50'
        },
        tags: {
            testId: 'S8',
            testGroup: 'Checkout',
        },
        iterations: 10,
    },
};

const checkoutScenario = new CheckoutScenario('B2B_MP');

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}
