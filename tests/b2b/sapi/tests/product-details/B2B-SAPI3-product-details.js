import { SharedProductDetailsScenario } from '../../../../cross-product/sapi/scenarios/product-details/shared-product-details-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B';
const testId = 'SAPI3';

const productDetailsScenario = new SharedProductDetailsScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI3_Product_Details: {
        exec: 'executeProductDetailsScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'Product Details',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${productDetailsScenario.getStorefrontApiBaseUrl()}/concrete-products/\${}}`] = ['avg<70'];

export function executeProductDetailsScenario() {
    productDetailsScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
