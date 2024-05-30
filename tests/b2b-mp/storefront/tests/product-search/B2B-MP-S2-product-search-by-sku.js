import { SharedProductSearchBySkuScenario } from '../../../../cross-product/storefront/scenarios/product-search/shared-product-search-by-sku-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S2_Product_Search: {
        exec: 'executeProductSearchPageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S2',
            testGroup: 'ProductSearch',
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ['avg<250'];

const productSearchPageScenario = new SharedProductSearchBySkuScenario('B2B_MP');

export function executeProductSearchPageScenario() {
    productSearchPageScenario.execute();
}
