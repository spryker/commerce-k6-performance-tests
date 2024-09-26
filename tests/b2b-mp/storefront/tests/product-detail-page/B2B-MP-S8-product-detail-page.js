import { SharedProductDetailPageScenario } from '../../../../cross-product/storefront/scenarios/product-detail-page/shared-product-detail-page-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S8_Product_detail_page: {
        exec: 'executeProductDetailPageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S8',
            testGroup: 'ProductDetailPage',
        },
        iterations: 10
    },
};
options.thresholds['group_duration{group:::ProductDetailPage}'] = ['avg < 300'];

const productDetailPageScenario = new SharedProductDetailPageScenario('B2B_MP');

export function executeProductDetailPageScenario() {
    productDetailPageScenario.execute();
}
