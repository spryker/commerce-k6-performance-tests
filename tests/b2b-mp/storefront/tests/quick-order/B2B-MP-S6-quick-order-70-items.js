import { SharedQuickOrderScenario } from '../../../../cross-product/storefront/scenarios/quick-order/shared-quick-order-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
  S6_Quick_order_70_items: {
    exec: 'executeQuickOrderScenario',
    executor: 'shared-iterations',
    env: {
      productSku: '657712',
      numberOfItems: '70',
    },
    tags: {
      testId: 'S6',
      testGroup: 'Quick order',
    },
    options: {
      browser: {
        type: 'chromium',
      },
    },
    iterations: 10,
  },
};

const quickOrderScenario = new SharedQuickOrderScenario('B2B_MP');

export async function executeQuickOrderScenario() {
  await quickOrderScenario.execute();
}
