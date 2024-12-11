import { SharedOrderManagementListScenario } from '../../../../../cross-product/backoffice/scenarios/order-management/shared-order-management-list-scenario.js';
import { CheckoutScenario } from '../../../../sapi/scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../../lib/utils.js';

const sharedCheckoutScenario = new CheckoutScenario('B2B');
const sharedOrderManagementListScenario = new SharedOrderManagementListScenario('B2B', sharedCheckoutScenario);

export const options = loadDefaultOptions();
options.scenarios = {
    Order_Management_List: {
        exec: 'executeSharedOrderManagementListScenario',
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
// options.thresholds = {
//     'http_req_duration{name:salesPage}': ['avg<600'],
//     'http_req_duration{name:salesTable}': ['avg<600'],
// };

export async function executeSharedOrderManagementListScenario() {
    await sharedOrderManagementListScenario.execute();
}