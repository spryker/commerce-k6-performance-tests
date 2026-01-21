// tags: smoke, load, soak, checkout, SAPI
// Combined API test suite: All SAPI tests from the checkout folder
import { group } from 'k6';
import {
  options as sapi7Options,
  setup as sapi7Setup,
  default as runSAPI7Test,
} from '../checkout/SAPI7_checkout_1.test.js';
import {
  options as sapi9Options,
  setup as sapi9Setup,
  default as runSAPI9Test,
} from '../checkout/SAPI9_checkout_70.test.js';

// Merge options from all tests
export const options = {
  ...sapi7Options,
  ...sapi9Options,
  thresholds: {
    ...sapi7Options.thresholds,
    ...sapi9Options.thresholds,
  },
};

export function setup() {
  return {
    sapi7Data: sapi7Setup(),
    sapi9Data: sapi9Setup(),
  };
}

export default function (data) {
  group('SAPI7_checkout_1', () => {
    runSAPI7Test(data.sapi7Data);
  });

  group('SAPI9_checkout_70', () => {
    runSAPI9Test(data.sapi9Data);
  });
}
