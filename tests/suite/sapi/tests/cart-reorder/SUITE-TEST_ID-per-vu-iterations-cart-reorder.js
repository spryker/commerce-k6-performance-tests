import { loadDefaultOptions } from '../../../../../lib/utils.js';
import {
    SharedCartReorderScenario
} from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const iterations = 10;
const virtualUsersCount = 10;
const environment = 'SUITE';
const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    TEST_ID_Cart_Reorder: {
        exec: 'execute',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'TEST_ID',
            testGroup: 'Cart Reorder',
        },
        iterations: iterations,
        vus: virtualUsersCount,
    },
};
options.thresholds[`http_req_duration{url:${sharedCartReorderScenario.getStorefrontApiBaseUrl()}/cart-reorder}`] = ['avg<409'];

export function setup() {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(virtualUsersCount, iterations);
}

export function execute(data) {
    const customerIndex = __VU % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = __ITER % quoteIds.length;

    // Place an order
    const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[quoteIndex], false);

    // Reorder
    sharedCartReorderScenario.execute(customerEmail, checkoutResponseJson.data.relationships.orders.data[0].id);
}
