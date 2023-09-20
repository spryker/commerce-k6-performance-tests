import { SharedCheckoutScenario } from "../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();

options.scenarios = {
    SAPI8_Add_70_items_to_cart: {
        exec: 'executeAddToCartScenario',
        executor: 'shared-iterations',
        env: {
            sku: __ENV.sku || '100429',
            quantity: __ENV.quantity || '70'
        },
        tags: {
            testId: 'SAPI8',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const addToCartScenario = new SharedCheckoutScenario('B2B_MP');

export function executeAddToCartScenario() {
    addToCartScenario.execute(__ENV.sku, __ENV.quantity);
}
