import { SharedNavigationWithFullCartScenario } from '../../../../cross-product/storefront/scenarios/navigtion/shared-navigation-with-full-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S9_Navigation_full_cart: {
        exec: 'executeNavigationWithFullCartScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S9',
            testGroup: 'Navigation',
        },
        iterations: 1
    },
};
options.thresholds.http_req_duration = ['avg<581'];

const navigationWithFullCartScenario = new SharedNavigationWithFullCartScenario('B2B_MP');

export function executeNavigationWithFullCartScenario() {
    navigationWithFullCartScenario.execute();
}
