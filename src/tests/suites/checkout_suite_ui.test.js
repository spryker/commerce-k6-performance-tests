// tags: smoke, load, soak, checkout, S
// Combined UI test suite: All UI tests from the checkout folder
import { group } from 'k6';
import { options as s4Options, setup as s4Setup, default as runS4Test } from '../checkout/S4_checkout_70.test.js';

// Merge options from all tests
export const options = {
  ...s4Options,
  thresholds: {
    ...s4Options.thresholds,
  },
};

export function setup() {
  return {
    s4Data: s4Setup(),
  };
}

export default function (data) {
  group('S4_checkout_70', () => {
    runS4Test(data.s4Data);
  });
}
