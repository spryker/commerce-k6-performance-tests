import { SharedCartsScenario } from '../../../../cross-product/sapi/scenarios/cart/shared-carts-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const sharedCartsScenario = new SharedCartsScenario('B2B');

export const options = loadDefaultOptions();
options.scenarios = {
  SAPI4_Carts: {
    exec: 'executeCartsScenario',
    executor: 'shared-iterations',
    tags: {
      testId: 'SAPI4',
      testGroup: 'Cart',
    },
    iterations: 10,
  },
};
options.thresholds['http_req_duration{request_name:sapi_get_carts}'] = ['avg<327'];

export function executeCartsScenario() {
  sharedCartsScenario.execute();
}
