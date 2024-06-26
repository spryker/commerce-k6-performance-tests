import { SharedProductSearchScenario } from '../../../../cross-product/sapi/scenarios/product-search/shared-product-search-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const productSearchScenario = new SharedProductSearchScenario('B2B_MP');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI2_Product_Search: {
        exec: 'executeProductSearchScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI2',
            testGroup: 'Product Search',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${productSearchScenario.getStorefrontApiBaseUrl()}/catalog-search?q=\${}}`] = ['avg<176'];

export function executeProductSearchScenario() {
    productSearchScenario.execute();
}
