import { SharedCrudShoppingList } from '../../../../cross-product/storefront/scenarios/shopping-list/shared-crud-shopping-list.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S11_ShoppingList_CRUD: {
        exec: 'executeCrudShoppingListScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S11',
            testGroup: 'Navigation',
        },
        env: {
            productSku: '657712',
            quantity: '1',
        },
        options: {
            browser: {
                type: 'chromium',
            },
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ['avg<581'];

const crudShoppingListScenario = new SharedCrudShoppingList('B2B');

export async function executeCrudShoppingListScenario() {
    await crudShoppingListScenario.execute();
}
