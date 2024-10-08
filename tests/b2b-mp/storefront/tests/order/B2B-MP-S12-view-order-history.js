import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedViewOrderHistoryScenario } from "../../../../cross-product/storefront/scenarios/order/shared-view-order-history.js";
export { handleSummary } from '../../../../../helpers/summary-helper.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S12_OrderHistory_view: {
        exec: 'executeViewOrderHistoryScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S12',
            testGroup: 'Order',
        },
        iterations: 1
    },
};
options.thresholds.http_req_duration = ['avg<581'];

const viewOrderHistoryScenario = new SharedViewOrderHistoryScenario('B2B_MP');

export function executeViewOrderHistoryScenario() {
    viewOrderHistoryScenario.execute();
}
