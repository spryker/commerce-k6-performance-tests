// tags: smoke, load, order-management, order-amendment, S, B, M
// Combined UI test suite: All UI tests from the order-management and order-amendment folders
import { group } from 'k6';
import {
  options as b1Options,
  setup as b1Setup,
  default as runB1Test,
} from '../order-management/B1_orders_list.test.js';
import { options as b3Options, setup as b3Setup, default as runB3Test } from '../order-management/B3_pay_order.test.js';
import {
  options as m1Options,
  setup as m1Setup,
  default as runM1Test,
} from '../order-management/M1_orders_list.test.js';
import {
  options as m3Options,
  setup as m3Setup,
  default as runM3Test,
} from '../order-management/M3_ship_order.test.js';
import {
  options as s13Options,
  setup as s13Setup,
  default as runS13Test,
} from '../order-management/S13_cancel_order.test.js';

// Merge options from all tests
export const options = {
  ...b1Options,
  ...b3Options,
  ...m1Options,
  ...m3Options,
  ...s13Options,
  thresholds: {
    ...b1Options.thresholds,
    ...b3Options.thresholds,
    ...m1Options.thresholds,
    ...m3Options.thresholds,
    ...s13Options.thresholds,
  },
};

export function setup() {
  return {
    b1Data: b1Setup(),
    b3Data: b3Setup(),
    m1Data: m1Setup(),
    m3Data: m3Setup(),
    s13Data: s13Setup(),
  };
}

export default function (data) {
  group('B1_orders_list', () => {
    runB1Test(data.b1Data);
  });

  group('B3_pay_order', () => {
    runB3Test(data.b3Data);
  });

  group('M1_orders_list', () => {
    runM1Test(data.m1Data);
  });

  group('M3_ship_order', () => {
    runM3Test(data.m3Setup);
  });

  group('S13_cancel_order', () => {
    runS13Test(data.s13Data);
  });
}
