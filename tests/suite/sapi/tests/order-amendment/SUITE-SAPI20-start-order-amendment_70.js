import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import {
    SharedOrderAmendmentScenario
} from '../../../../cross-product/sapi/scenarios/order-amendment/shared-order-amendment-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 10;
const iterations = 1;

const environment = 'SUITE';
const thresholdTag = 'SAPI20_start_order_amendment_70';

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedOrderAmendmentScenario = new SharedOrderAmendmentScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI20_start_order_amendment_70: {
        exec: 'execute',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'SAPI20',
            testGroup: 'Order Amendment',
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

    // Edit an order
    sharedOrderAmendmentScenario.execute(customerEmail, checkoutResponseJson.data.attributes.orderReference, thresholdTag);
}
