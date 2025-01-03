import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { Trend } from 'k6/metrics';
import { SharedCartReorderScenario } from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 10;
const iterations = 1;

const environment = 'SUITE';
const thresholdTag = 'cart_reorder_50';
let responseDuration = new Trend('cart_reorder_50');

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
  SAPI15_cart_reorder_50: {
    exec: 'execute',
    executor: 'per-vu-iterations',
    tags: {
      testId: 'SAPI15',
      testGroup: 'Cart Reorder',
    },
    vus: vus,
    iterations: iterations,
  },
};
// options.thresholds[`http_req_duration{name:${thresholdTag}}`] = ['avg<300'];

export function setup() {
  return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(vus, iterations, 10, 10000);
}

export function execute(data) {
  const customerIndex = (__VU - 1) % data.length;
  const { customerEmail, quoteIds } = data[customerIndex];
  const quoteIndex = __ITER % quoteIds.length;

  // Place an order
  const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[quoteIndex], false);

  // Reorder
  const res = sharedCartReorderScenario.execute(
    customerEmail,
    checkoutResponseJson.data.relationships.orders.data[0].id,
    thresholdTag
  );
  responseDuration.add(res.timings.duration);
}
