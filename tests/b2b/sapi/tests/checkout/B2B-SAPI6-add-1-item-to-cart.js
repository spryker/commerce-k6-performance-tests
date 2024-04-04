import { SharedAddToCartScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-add-to-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();

options.scenarios = {
    SAPI6_Add_1_item_to_cart: {
        exec: 'executeAddToCartScenario',
        executor: 'shared-iterations',
        env: {
            sku: '100429',
            quantity: '1'
        },
        tags: {
            testId: 'SAPI6',
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};

const addToCartScenario = new SharedAddToCartScenario('B2B');

export function executeAddToCartScenario() {
    addToCartScenario.execute(__ENV.sku, __ENV.quantity);
}
