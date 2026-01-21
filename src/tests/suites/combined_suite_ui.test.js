// tags: smoke, load, soak, access-token, dashboard, homepage, marketplace, shopping-list, S, B, M
// Combined UI test suite: All UI tests from access-token, dashboard, homepage, marketplace, and shopping-list folders
import { group } from 'k6';
import {
  options as m8Options,
  setup as m8Setup,
  teardown as m8Teardown,
  default as runM8Test,
} from '../dashboard/M8_view_dashboard.test.js';
import { options as s1Options, default as runS1Test } from '../homepage/S1_view_homepage.test.js';
import {
  options as b12Options,
  setup as b12Setup,
  default as runB12Test,
} from '../marketplace/B12_marketplace_orders.test.js';

// Merge options from all tests
export const options = {
  ...m8Options,
  ...s1Options,
  ...b12Options,
  thresholds: {
    ...m8Options.thresholds,
    ...s1Options.thresholds,
    ...b12Options.thresholds,
  },
};

export function setup() {
  return {
    m8Data: m8Setup(),
    b12Data: b12Setup(),
  };
}

export function teardown() {
  m8Teardown();
}

export default function (data) {
  group('M8_view_dashboard', () => {
    runM8Test(data.m8Data);
  });

  group('S1_view_homepage', () => {
    runS1Test();
  });

  group('B12_marketplace_orders', () => {
    runB12Test();
  });
}
