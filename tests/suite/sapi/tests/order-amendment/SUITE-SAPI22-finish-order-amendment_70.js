import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import {
    SharedOrderAmendmentScenario
} from '../../../../cross-product/sapi/scenarios/order-amendment/shared-order-amendment-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 10;
const iterations = 1;
const itemCount = 70;
const defaultItemPrice = 1000; // 10.00 EUR
const environment = 'SUITE';
const thresholdTag = 'finish_order_amendment_70';

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedOrderAmendmentScenario = new SharedOrderAmendmentScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI22_finish_order_amendment_70: {
        exec: 'execute',
        executor: 'per-vu-iterations',
        tags: {
            testId: 'SAPI22',
            testGroup: 'Order Amendment',
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

    // Edit an order
    const cartReorderResponseJson = sharedOrderAmendmentScenario.haveOrderAmendment(
        customerEmail,
        checkoutResponseJson.data.relationships.orders.data[0].id
    );

    // Place an updated order
    sharedCheckoutScenario.haveOrder(customerEmail, cartReorderResponseJson.data.id, false, thresholdTag);
}
