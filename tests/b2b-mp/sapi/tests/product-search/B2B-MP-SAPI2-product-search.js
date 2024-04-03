import { SharedProductSearchScenario } from '../../../../cross-product/sapi/scenarios/product-search/shared-product-search-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

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

const productSearchScenario = new SharedProductSearchScenario('B2B_MP');

export function executeProductSearchScenario() {
  productSearchScenario.execute();
}
