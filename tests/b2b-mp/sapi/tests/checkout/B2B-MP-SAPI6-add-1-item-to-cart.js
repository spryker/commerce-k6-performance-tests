import { SharedAddToCartScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-add-to-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI6';

const addToCartScenario = new SharedAddToCartScenario(environment);

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
            testId: testId,
            testGroup: 'Checkout',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${addToCartScenario.getStorefrontApiBaseUrl()}/carts/\${}/items}`] = ['avg<598'];

export function executeAddToCartScenario() {
    addToCartScenario.execute(__ENV.sku, __ENV.quantity);
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
