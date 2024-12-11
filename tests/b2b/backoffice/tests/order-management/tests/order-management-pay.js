import { SharedOrderManagementPayScenario } from '../../../../../cross-product/backoffice/scenarios/order-management/shared-order-management-pay-scenario.js';
import { CheckoutScenario } from '../../../../sapi/scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../../lib/utils.js';

const sharedCheckoutScenario = new CheckoutScenario('B2B');
const sharedOrderManagementPayScenario = new SharedOrderManagementPayScenario('B2B', sharedCheckoutScenario);

export const options = loadDefaultOptions();
options.scenarios = {
    Order_Management_Pay: {
        exec: 'executeSharedOrderManagementPayScenario',
        executor: 'shared-iterations',
        vus: 1,
        iterations: 10,
    },
};
options.thresholds[`http_req_duration{url:${sharedOrderManagementPayScenario.getBackofficeBaseUrl()}/sales/detail?id-sales-order=\${}}`] = ['avg<600'];
// options.thresholds[`http_req_duration{url:${sharedOrderManagementPayScenario.getBackofficeBaseUrl()}/sales/detail?id-sales-order=\${}}`] = ['avg<600'];

export function executeSharedOrderManagementPayScenario() {
    sharedOrderManagementPayScenario.execute();
}