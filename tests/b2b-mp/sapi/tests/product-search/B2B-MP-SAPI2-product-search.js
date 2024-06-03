import { SharedProductSearchScenario } from '../../../../cross-product/sapi/scenarios/product-search/shared-product-search-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI2';

const productSearchScenario = new SharedProductSearchScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI2_Product_Search: {
        exec: 'executeProductSearchScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'Product Search',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${productSearchScenario.getStorefrontApiBaseUrl()}/catalog-search?q=\${}}`] = ['avg<176'];

export function executeProductSearchScenario() {
    productSearchScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
