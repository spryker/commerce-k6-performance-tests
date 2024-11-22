import { loadDefaultOptions } from '../../../../../lib/utils.js';
import {
    SharedCartReorderScenario
} from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import { DynamicFixturesHelper } from '../../../../../helpers/dynamic-fixtures-helper.js';
import { Http } from '../../../../../lib/http.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const iterations = 10;
const environment = 'SUITE';
const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    TEST_ID_Cart_Reorder: {
        exec: 'executeCartReorderScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'TEST_ID',
            testGroup: 'Cart Reorder',
        },
        iterations: iterations
    },
};
options.thresholds[`http_req_duration{url:${sharedCartReorderScenario.getStorefrontApiBaseUrl()}/cart-reorder}`] = ['avg<327'];

export function setup() {
    const dynamicFixturesHelper = new DynamicFixturesHelper(
        'http://glue-backend.eu.spryker.local', // TODO: replace with the actual Glue URL
        new Http()
    );

    return dynamicFixturesHelper.haveCustomerWithQuoteAndItems(iterations, 10, 5000);
}

export function executeCartReorderScenario(data) {
    const customerEmail = data.customerEmail;
    const quoteIds = data.quoteIds;
    const quoteId = quoteIds[__ITER % quoteIds.length];

    const checkoutResponseJson = sharedCheckoutScenario.placeOrder(customerEmail, quoteId);
    const orderId = checkoutResponseJson.data.relationships.orders.data[0].id;

    sharedCartReorderScenario.execute(customerEmail, orderId);
}
