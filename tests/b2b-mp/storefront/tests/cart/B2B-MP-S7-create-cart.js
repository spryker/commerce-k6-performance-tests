import { SharedCreateCartScenario } from '../../../../cross-product/storefront/scenarios/cart/shared-create-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
    S7_Create_cart: {
        exec: 'executeCreateCartScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S7',
            testGroup: 'Cart',
        },
        options: {
            browser: {
                type: 'chromium',
            },
        },
        iterations: 10,
    },
};

const createCartScenario = new SharedCreateCartScenario('B2B_MP');

export async function executeCreateCartScenario() {
    await createCartScenario.execute();
}
