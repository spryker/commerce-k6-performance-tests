import { CheckoutScenario } from "../../scenarios/checkout/checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

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

const checkoutScenario = new CheckoutScenario('B2B');

export function executeCheckoutScenario() {
    checkoutScenario.execute(__ENV.numberOfItems);
}
