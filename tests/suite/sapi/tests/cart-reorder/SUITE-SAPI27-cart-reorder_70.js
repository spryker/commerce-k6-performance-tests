import { loadDefaultOptions } from '../../../../../lib/utils.js';
import {
    SharedCartReorderScenario
} from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 1;
const iterations = 10;

const environment = 'SUITE';
const thresholdTag = 'SAPI27_cart_reorder_70';

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI27_cart_reorder_70: {
        exec: 'execute',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'SAPI27',
            testGroup: 'Cart Reorder',
        },
        vus: vus,
        iterations: iterations,
    },
};
options.thresholds[`http_req_duration{name:${thresholdTag}}`] = ['avg<300'];

export function setup() {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(vus, iterations, 70);
}

export function teardown() {
    sharedCheckoutScenario.dynamicFixturesHelper.haveConsoleCommands(['console queue:worker:start --stop-when-empty']);
}

export function execute(data) {
    const customerIndex = (__VU - 1) % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = __ITER % quoteIds.length;

    // Place an order
    const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[quoteIndex], false);

    // Reorder
    sharedCartReorderScenario.execute(customerEmail, checkoutResponseJson.data.relationships.orders.data[0].id, thresholdTag);
}
