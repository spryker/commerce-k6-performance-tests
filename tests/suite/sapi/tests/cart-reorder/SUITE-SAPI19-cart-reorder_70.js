import { loadDefaultOptions } from '../../../../../lib/utils.js';
import {
    SharedCartReorderScenario
} from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 10;
const iterations = 1;
const itemCount = 70;
const defaultItemPrice = 1000; // 10.00 EUR
const environment = 'SUITE';
const thresholdTag = 'cart_reorder_70';

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI19_cart_reorder_70: {
        exec: 'execute',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'SAPI19',
            testGroup: 'Cart Reorder',
        },
        vus: vus,
        iterations: iterations,
    },
};
options.thresholds[`http_req_duration{name:${thresholdTag}}`] = ['avg<300'];

export function setup() {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(vus, iterations, itemCount, defaultItemPrice);
}

export function execute(data) {
    const vus = __VU - 1;
    const customerIndex = vus % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = __ITER % quoteIds.length;

    // Place an order
    const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[quoteIndex], false);

    // Reorder
    sharedCartReorderScenario.execute(customerEmail, checkoutResponseJson.data.relationships.orders.data[0].id, thresholdTag);
}
