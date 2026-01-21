// tags: smoke, load, order-management, order-amendment, SAPI
// Combined API test suite: All SAPI tests from the order-management and order-amendment folders
import { group } from 'k6';
import {
  options as sapi38Options,
  setup as sapi38Setup,
  default as runSAPI38Test,
} from '../order-management/SAPI38_order_history_view_10_70.test.js';

// Merge options from all tests
export const options = {
  ...sapi38Options,
  thresholds: {
    ...sapi38Options.thresholds,
  },
};

export function setup() {
  return {
    sapi38Data: sapi38Setup(),
  };
}

export default function (data) {
  group('SAPI38_order_history_view_10_70', () => {
    runSAPI38Test(data.sapi38Data);
  });
}
