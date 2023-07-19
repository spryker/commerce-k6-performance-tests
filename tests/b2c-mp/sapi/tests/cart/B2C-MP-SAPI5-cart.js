import { CartScenario } from "../../scenarios/cart/cart-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI5_Cart: {
        exec: 'executeCartScenario',
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

const cartScenario = new CartScenario('B2C_MP');

export function executeCartScenario() {
    cartScenario.execute();
}

