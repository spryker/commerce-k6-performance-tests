import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import {
    SharedOrderAmendmentScenario
} from '../../../../cross-product/sapi/scenarios/order-amendment/shared-order-amendment-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 1;
const iterations = 10;

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
    if (isSequentialSetup()) {
        return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(iterations, 1, 70);
    }

    if (isConcurrentSetup()) {
        return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(vus, iterations, 70);
    }

    throw new Error('Invalid setup configuration');
}

export function execute(data) {
    const { customerEmail, quoteIds } = getCustomerData(data);
    const quoteIndex = getQuoteIndex(quoteIds);

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

function getCustomerData(data) {
    let customerIndex;

    if (isSequentialSetup()) {
        customerIndex = __ITER % data.length;
    } else if (isConcurrentSetup()) {
        customerIndex = (__VU - 1) % data.length;
    }

    return data[customerIndex];
}

function getQuoteIndex(quoteIds) {
    return isSequentialSetup() ? 0 : __ITER % quoteIds.length;
}

function isConcurrentSetup() {
    return vus > 1 && iterations === 1;
}

function isSequentialSetup() {
    return vus === 1 && iterations > 1;
}
