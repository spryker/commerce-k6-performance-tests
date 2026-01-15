// tags: smoke, load, soak, product, SAPI
// Combined API test suite: All SAPI tests from the product, product-management, product-search, product-details folders
import { group } from 'k6';
import {
    options as sapi12Options,
    setup as sapi12Setup,
    default as runSAPI12Test
} from '../product/SAPI12_concrete_product_all_includes_1.test.js';
import {
    options as sapi13Options,
    setup as sapi13Setup,
    default as runSAPI13Test
} from '../product/SAPI13_abstract_product_all_includes_1.test.js';
import {
    options as sapi14Options,
    setup as sapi14Setup,
    default as runSAPI14Test
} from '../product-search/SAPI14_product_search_by_filters.test.js';
import {
    options as sapi2Options,
    setup as sapi2Setup,
    default as runSAPI2Test
} from '../product-search/SAPI2_product_search_by_sku_1.test.js';
import {
    options as sapi43Options,
    setup as sapi43Setup,
    default as runSAPI43Test
} from '../product-search/SAPI43_category_view.test.js';
import {
    options as sapi3Options,
    setup as sapi3Setup,
    default as runSAPI3Test
} from '../product-details/SAPI3_product_details_retrieve_information_1.test.js';

// Merge options from all tests
export const options = {
    ...sapi12Options,
    ...sapi13Options,
    ...sapi14Options,
    ...sapi2Options,
    ...sapi43Options,
    ...sapi3Options,
    thresholds: {
        ...sapi12Options.thresholds,
        ...sapi13Options.thresholds,
        ...sapi14Options.thresholds,
        ...sapi2Options.thresholds,
        ...sapi43Options.thresholds,
        ...sapi3Options.thresholds,
    },
};

export function setup() {
    return {
        sapi12Data: sapi12Setup(),
        sapi13Data: sapi13Setup(),
        sapi14Data: sapi14Setup(),
        sapi2Data: sapi2Setup(),
        sapi43Data: sapi43Setup(),
        sapi3Data: sapi3Setup(),
    };
}

export default function (data) {
    group('SAPI12_concrete_product_all_includes_1', () => {
        runSAPI12Test(data.sapi12Data);
    });

    group('SAPI13_abstract_product_all_includes_1', () => {
        runSAPI13Test(data.sapi13Data);
    });

    group('SAPI14_product_search_by_filters', () => {
        runSAPI14Test(data.sapi14Data);
    });

    group('SAPI2_product_search_by_sku_1', () => {
        runSAPI2Test(data.sapi2Data);
    });

    group('SAPI43_category_view', () => {
        runSAPI43Test(data.sapi43Data);
    });

    group('SAPI3_product_details_retrieve_information_1', () => {
        runSAPI3Test(data.sapi3Data);
    });
}
