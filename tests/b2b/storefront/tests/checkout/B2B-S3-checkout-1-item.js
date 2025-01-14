import { SharedCheckoutScenario } from '../../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const checkoutScenario = new SharedCheckoutScenario('B2B');
const storefrontBaseUrl = checkoutScenario.getStorefrontBaseUrl();

export const options = loadDefaultOptions();
options.scenarios = {
  S3_Checkout_1_item: {
    exec: 'executeCheckoutScenario',
    executor: 'shared-iterations',
    env: {
      numberOfItems: '1',
    },
    tags: {
      testId: 'S3',
      testGroup: 'Checkout',
    },
    iterations: 10,
  },
};
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/\${}}`] = ['avg<552'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart/add/657712}`] = ['avg<547'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart}`] = ['avg<765'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout}`] = ['avg<421'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/address}`] = ['avg<628'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/shipment}`] = ['avg<475'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/payment}`] = ['avg<507'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/summary}`] = ['avg<472'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/place-order}`] = ['avg<604'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/success}`] = ['avg<1009'];

export function executeCheckoutScenario() {
  checkoutScenario.execute();
}
