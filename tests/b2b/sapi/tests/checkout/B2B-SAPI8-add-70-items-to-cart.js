import { SharedAddToCartScenario } from "../../../../cross-product/sapi/scenarios/checkout/shared-add-to-cart-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();

options.scenarios = {
    SAPI8_Add_70_items_to_cart: {
        exec: 'executeAddToCartScenario',
        executor: 'shared-iterations',
        env: {
            sku: '100429',
            quantity: '70'
        },
        tags: {
            testId: 'SAPI8',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const addToCartScenario = new SharedAddToCartScenario('B2B');

export function executeAddToCartScenario() {
    addToCartScenario.execute(__ENV.sku, __ENV.quantity);
}
