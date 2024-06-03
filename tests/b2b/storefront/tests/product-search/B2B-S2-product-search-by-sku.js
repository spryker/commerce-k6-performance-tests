import { SharedProductSearchBySkuScenario } from '../../../../cross-product/storefront/scenarios/product-search/shared-product-search-by-sku-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B';
const testId = 'S2';

export const options = loadDefaultOptions();

options.scenarios = {
    S2_Product_Search: {
        exec: 'executeProductSearchPageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'ProductSearch',
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ['avg<447'];

const productSearchPageScenario = new SharedProductSearchBySkuScenario(environment);

export function executeProductSearchPageScenario() {
    productSearchPageScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
