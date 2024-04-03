import { CheckoutScenario } from '../../scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
  S3_Checkout_1_item: {
    exec: 'executeCheckoutScenario',
    executor: 'shared-iterations',
    env: {
      numberOfItems: '1'
    },
    tags: {
      testId: 'S3',
      testGroup: 'Checkout',
    },
    iterations: 10,
  },
};

//scenario objects must be created outside any function used in execute phase since some initialization actions are done on
//K6 "init" stage (in the current implementation such init action are done in class constructor).
const checkoutScenario = new CheckoutScenario('B2B_MP');

export function executeCheckoutScenario() {
  checkoutScenario.execute();
}
