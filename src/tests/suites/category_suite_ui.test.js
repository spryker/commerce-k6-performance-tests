// tags: smoke, load, category, S
// Combined UI test suite: All UI tests from the category folder
import { group } from 'k6';
import {
    options as s25Options,
    setup as s25Setup,
    teardown as s25Teardown,
    default as runS25Test
} from '../category/S25_category_filter.test.js';

// Merge options from all tests
export const options = {
    ...s25Options,
    thresholds: {
        ...s25Options.thresholds,
    },
};

export function setup() {
    return {
        s25Data: s25Setup(),
    };
}

export function teardown() {
    s25Teardown();
}

export default function (data) {
    group('S25_category_filter', () => {
        runS25Test(data.s25Data);
    });
}
