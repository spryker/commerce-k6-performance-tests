// tags: smoke, load, soak, access-token, dashboard, homepage, marketplace, shopping-list, SAPI
// Combined API test suite: all SAPI tests from access-token, dashboard, homepage, marketplace, shopping-list folders
import { group } from 'k6';
import {
  options as sapi42Options,
  setup as sapi42Setup,
  default as runSAPI42Test,
} from '../access-token/SAPI42_access_token.test.js';
import {
  options as sapi1Options,
  setup as sapi10Setup,
  default as runSAPI1Test,
} from '../homepage/SAPI1_view_homepage.test.js';
import {
  options as sapi36Options,
  setup as sapi36Setup,
  default as runSAPI36Test,
} from '../shopping-list/SAPI36_view_shopping_list_70.test.js';
import {
  options as sapi37Options,
  setup as sapi37Setup,
  default as runSAPI37Test,
} from '../shopping-list/SAPI37_crud_shopping_list.test.js';

// Merge options from all tests
export const options = {
  ...sapi42Options,
  ...sapi1Options,
  ...sapi36Options,
  ...sapi37Options,
  thresholds: {
    ...sapi42Options.thresholds,
    ...sapi1Options.thresholds,
    ...sapi36Options.thresholds,
    ...sapi37Options.thresholds,
  },
};

export function setup() {
  return {
    sapi42Data: sapi42Setup(),
    sapi36Data: sapi36Setup(),
    sapi37Data: sapi37Setup(),
    sapi10Data: sapi10Setup(),
  };
}

export default function (data) {
  group('SAPI42_access_token', () => {
    runSAPI42Test(data.sapi42Data);
  });

  group('SAPI1_view_homepage', () => {
    runSAPI1Test(data.sapi10Data);
  });

  group('SAPI36_view_shopping_list_70', () => {
    runSAPI36Test(data.sapi36Data);
  });

  group('SAPI37_crud_shopping_list', () => {
    runSAPI37Test(data.sapi37Data);
  });
}
