import { SharedCheckoutScenario } from "../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI6_Checkout: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            sku: __ENV.sku || '100429'
        },
        tags: {
            testId: 'SAPI6',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const checkoutScenario = new SharedCheckoutScenario('B2B_MP');

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}
