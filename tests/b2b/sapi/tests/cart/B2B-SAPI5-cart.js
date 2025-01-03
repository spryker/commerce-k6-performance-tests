import { SharedCartScenario } from '../../../../cross-product/sapi/scenarios/cart/shared-cart-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const sharedCartScenario = new SharedCartScenario('B2B');

export const options = loadDefaultOptions();
options.scenarios = {
  SAPI5_Cart: {
    exec: 'executeSharedCartScenario',
    executor: 'shared-iterations',
    env: {
      numberOfItems: '1',
    },
    tags: {
      testId: 'SAPI5',
      testGroup: 'Cart',
    },
    iterations: 10,
  },
};
options.thresholds[`http_req_duration{url:${sharedCartScenario.getStorefrontApiBaseUrl()}/carts/\${}/?include=items}`] =
  ['avg<327'];

export function executeSharedCartScenario() {
  sharedCartScenario.execute();
}
