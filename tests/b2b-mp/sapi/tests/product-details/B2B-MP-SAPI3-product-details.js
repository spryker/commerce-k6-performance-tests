import { SharedProductDetailsScenario } from '../../../../cross-product/sapi/scenarios/product-details/shared-product-details-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const productDetailsScenario = new SharedProductDetailsScenario('B2B_MP');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI3_Product_Details: {
        exec: 'executeProductDetailsScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI3',
            testGroup: 'Product Details',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${productDetailsScenario.getStorefrontApiBaseUrl()}/concrete-products/\${}}`] = ['avg<56'];

export function executeProductDetailsScenario() {
    productDetailsScenario.execute();
}
