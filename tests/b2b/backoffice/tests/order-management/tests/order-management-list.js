import { SharedOrderManagementListScenario } from '../../../../../cross-product/backoffice/scenarios/order-management/shared-order-management-list-scenario.js';
import { CheckoutScenario } from '../../../../sapi/scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../../lib/utils.js';
export { handleSummary } from '../../../../../../helpers/summary-helper.js';

const sharedCheckoutScenario = new CheckoutScenario('B2B');
const sharedOrderManagementListScenario = new SharedOrderManagementListScenario('B2B', sharedCheckoutScenario);
const backofficeUrl = sharedOrderManagementListScenario.urlHelper.getBackofficeBaseUrl();

export const options = loadDefaultOptions();
options.scenarios = {
    Order_Management_List: {
        exec: 'executeSharedOrderManagementListScenario',
        executor: 'shared-iterations',
        vus: 1,
        iterations: 10,
        options: {
            browser: {
                type: 'chromium',
            },
        },
    },
};

options.thresholds = {
    [`browser_http_req_duration{url:${backofficeUrl}/sales}`]: ['avg<600'],
    [`browser_http_req_duration{url:${backofficeUrl}/sales/index/table}`]: ['avg<600'],
}

export async function executeSharedOrderManagementListScenario() {
    await sharedOrderManagementListScenario.execute();
}