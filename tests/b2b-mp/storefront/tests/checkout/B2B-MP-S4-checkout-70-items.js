import { CheckoutScenario } from "../../scenarios/checkout/checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

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

const checkoutScenario = new CheckoutScenario('B2B_MP');

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}
