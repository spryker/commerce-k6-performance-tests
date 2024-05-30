import { CheckoutScenario } from '../../scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

//scenario objects must be created outside any function used in execute phase since some initialization actions are done on
//K6 "init" stage (in the current implementation such init action are done in class constructor).
const checkoutScenario = new CheckoutScenario('B2B_MP');
const storefrontBaseUrl = checkoutScenario.getStorefrontBaseUrl();

export const options = loadDefaultOptions();
options.scenarios = {
    S3_Checkout_1_item: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '1'
        },
        tags: {
            testId: 'S3',
            testGroup: 'Checkout',
        },
        iterations: 10,
    },
};
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/\${}}`] = ['avg<375'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart/add/657712}`] = ['avg<616'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart}`] = ['avg<805'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout}`] = ['avg<460'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/address}`] = ['avg<592'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/shipment}`] = ['avg<513'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/payment}`] = ['avg<519'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/summary}`] = ['avg<450'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/place-order}`] = ['avg<621'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/success}`] = ['avg<707'];

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}
