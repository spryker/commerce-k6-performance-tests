import { SharedOrderManagementPayScenario } from '../../../../../cross-product/backoffice/scenarios/order-management/shared-order-management-pay-scenario.js';
import { CheckoutScenario } from '../../../../sapi/scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../../lib/utils.js';
export { handleSummary } from '../../../../../../helpers/summary-helper.js';

const sharedCheckoutScenario = new CheckoutScenario('B2B');
const sharedOrderManagementPayScenario = new SharedOrderManagementPayScenario('B2B', sharedCheckoutScenario);
const backofficeUrl = sharedOrderManagementPayScenario.urlHelper.getBackofficeBaseUrl();

export const options = loadDefaultOptions();
options.scenarios = {
    Order_Management_Pay: {
        exec: 'executeSharedOrderManagementPayScenario',
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        options: {
            browser: {
                type: 'chromium',
            },
        },
    },
};

options.thresholds = {
    [`browser_http_req_duration{url:${backofficeUrl}/sales/detail}`]: ['avg<600'],
    [`browser_http_req_duration{url:${backofficeUrl}/oms/trigger/submit-trigger-event-for-order}`]: ['avg<600'],
}

export async function executeSharedOrderManagementPayScenario() {
    await sharedOrderManagementPayScenario.execute();
}