// tags: smoke, load, soak, category, SAPI
// Combined API test suite: All SAPI tests from the category folder
import { group } from 'k6';
import { options as sapi10Options, default as runSAPI10Test } from '../category/SAPI10_view_categories.test.js';
import {
  options as sapi11Options,
  setup as sapi11Setup,
  default as runSAPI11Test,
} from '../category/SAPI11_view_category.test.js';

// Merge options from all tests
export const options = {
  ...sapi10Options,
  ...sapi11Options,
  thresholds: {
    ...sapi10Options.thresholds,
    ...sapi11Options.thresholds,
  },
};

export function setup() {
  return {
    sapi11Data: sapi11Setup(),
  };
}

export default function (data) {
  group('SAPI10_view_categories', () => {
    runSAPI10Test();
  });

  group('SAPI11_view_category', () => {
    runSAPI11Test(data.sapi11Data);
  });
}
