import { SharedCartScenario } from "../../../../cross-product/storefront/scenarios/cart/shared-cart-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI5_Cart: {
        exec: 'executeCartsScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: __ENV.numberOfItems || '1'
        },
        tags: {
            testId: 'SAPI5',
            testGroup: 'Cart',
        },
        iterations: 10
    },
};

const sharedCartScenario = new SharedCartScenario('B2C_MP');

export function executeSharedCartScenario() {
    sharedCartScenario.execute();
}

