import { SharedViewShoppingListScenario } from "../../../../cross-product/storefront/scenarios/shopping-list/shared-view-shopping-list-scenario.js";
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S10_ShoppingList_view: {
        exec: 'executeViewShoppingListScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S9',
            testGroup: 'Navigation',
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ['avg<581'];

const viewShoppingListScenario = new SharedViewShoppingListScenario('B2B');

export function executeViewShoppingListScenario() {
    viewShoppingListScenario.execute();
}
