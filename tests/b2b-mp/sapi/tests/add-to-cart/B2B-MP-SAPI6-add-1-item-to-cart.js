import { SharedAddToCartScenario } from "../../../../cross-product/sapi/scenarios/add-to-cart/shared-add-to-cart-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();

options.scenarios = {
    SAPI6_Checkout: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            sku: __ENV.sku || '100429',
            quantity: '1'
        },
        tags: {
            testId: 'SAPI6',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const addToCartScenario = new SharedAddToCartScenario('B2B_MP');

export function executeCheckoutScenario() {
    addToCartScenario.execute();
}
