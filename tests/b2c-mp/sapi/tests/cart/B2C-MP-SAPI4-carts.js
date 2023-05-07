import { SharedCartsScenario } from "../../../../cross-product/storefront/scenarios/cart/shared-carts-scenario";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();

options.scenarios = {
    CartPage1VUS: {
        exec: 'executeCartsScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI4',
            testGroup: 'Cart',
        },
        iterations: 10
    },
};

const sharedCartsScenario = new SharedCartsScenario('B2C_MP');
export function executeCartsScenario() {
    sharedCartsScenario.execute();
}
