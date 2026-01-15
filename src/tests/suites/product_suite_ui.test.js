// tags: smoke, load, soak, product, S, B, M
// Combined UI test suite: All UI tests from the product, product-management, product-search, product-details folders
import { group } from 'k6';
import {
    options as s8Options,
    setup as s8Setup,
    default as runS8Test
} from '../product/S8_product_detail_page.test.js';
import {
    options as s2Options,
    setup as s2Setup,
    default as runS2Test
} from '../product-search/S2_product_search_1.test.js';
import {
    options as b4Options,
    default as runB4Test
} from '../product-management/B4_product_create.test.js';
import {
    options as m4Options,
    default as runM4Test
} from '../product-management/M4_product_create.test.js';

// Merge options from all tests
export const options = {
    ...s8Options,
    ...s2Options,
    ...b4Options,
    ...m4Options,
    thresholds: {
        ...s8Options.thresholds,
        ...s2Options.thresholds,
        ...b4Options.thresholds,
        ...m4Options.thresholds,
    },
};

export function setup() {
    return {
        s8Data: s8Setup(),
        s2Data: s2Setup(),
    };
}

export default function (data) {
    group('S8_product_detail_page', () => {
        runS8Test(data.s8Data);
    });

    group('S2_product_search_1', () => {
        runS2Test(data.s2Data);
    });

    group('B4_product_create', () => {
        runB4Test();
    });

    group('M4_product_create', () => {
        runM4Test();
    });
}
