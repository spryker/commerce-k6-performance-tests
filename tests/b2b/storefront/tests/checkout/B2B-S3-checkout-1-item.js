import { SharedCheckoutScenario } from "../../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();

options.scenarios = {
    S3_Checkout_1_item: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: __ENV.numberOfItems || '1'
        },
        tags: {
            testId: 'S3',
            testGroup: 'Checkout',
        },
        iterations: 10,
    },
};

const checkoutScenario = new SharedCheckoutScenario('B2B');

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}

