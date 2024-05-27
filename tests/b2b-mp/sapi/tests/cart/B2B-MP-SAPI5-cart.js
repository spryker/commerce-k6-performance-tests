import { SharedCartScenario } from '../../../../cross-product/sapi/scenarios/cart/shared-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI5_Cart: {
        exec: 'executeSharedCartScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '1'
        },
        tags: {
            testId: 'SAPI5',
            testGroup: 'Cart',
        },
        iterations: 10
    },
};
options.thresholds = {
    "http_req_duration{request_name:SAPI5_cart_view_single_cart}": ["avg<1000"],
};

const sharedCartScenario = new SharedCartScenario('B2B_MP');

export function executeSharedCartScenario() {
    sharedCartScenario.execute();
}
