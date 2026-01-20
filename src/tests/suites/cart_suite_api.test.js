// tags: smoke, load, soak, cart, SAPI
import { group } from 'k6';
import {
    options as sapi4Options,
    setup as sapi4Setup,
    runTest as runSAPI4Test
} from '../cart/SAPI4_cart_view_70.test.js';
import {
    options as sapi5Options,
    setup as sapi5Setup,
    runTest as runSAPI5Test
} from '../cart/SAPI5_cart_include_item_1.test.js';
import {
    options as sapi6Options,
    setup as sapi6Setup,
    runTest as runSAPI6Test
} from '../cart/SAPI6_cart_items_1.test.js';
import {
    options as sapi8Options,
    setup as sapi8Setup,
    runTest as runSAPI8Test
} from '../cart/SAPI8_cart_items_1.test.js';
import {
    options as sapi32Options,
    setup as sapi32Setup,
    runTest as runSAPI32Test
} from '../cart/SAPI32_cart_by_id_70.test.js';
import {
    options as sapi33Options,
    setup as sapi33Setup,
    runTest as runSAPI33Test
} from '../cart/SAPI33_create_carts.test.js';
import {
    options as sapi34Options,
    setup as sapi34Setup,
    runTest as runSAPI34Test
} from '../cart/SAPI34_remova_cart_items.test.js';
import {
    options as sapi35Options,
    setup as sapi35Setup,
    runTest as runSAPI35Test
} from '../cart/SAPI35_change_quantity_cart_items.test.js';

// Merge options from all tests
export const options = {
    ...sapi4Options,
    ...sapi5Options,
    ...sapi6Options,
    ...sapi8Options,
    ...sapi32Options,
    ...sapi33Options,
    ...sapi34Options,
    ...sapi35Options,
    thresholds: {
        ...sapi4Options.thresholds,
        ...sapi5Options.thresholds,
        ...sapi6Options.thresholds,
        ...sapi8Options.thresholds,
        ...sapi32Options.thresholds,
        ...sapi33Options.thresholds,
        ...sapi34Options.thresholds,
        ...sapi35Options.thresholds,
    },
};

export function setup() {
    return {
        sapi4Data: sapi4Setup(),
        sapi5Data: sapi5Setup(),
        sapi6Data: sapi6Setup(),
        sapi8Data: sapi8Setup(),
        sapi32Data: sapi32Setup(),
        sapi33Data: sapi33Setup(),
        sapi34Data: sapi34Setup(),
        sapi35Data: sapi35Setup(),
    };
}

export default function (data) {
    group('SAPI4_cart_view_70', () => {
        runSAPI4Test(data.sapi4Data);
    });

    group('SAPI5_cart_include_item_1', () => {
        runSAPI5Test(data.sapi5Data);
    });

    group('SAPI6_cart_items_1', () => {
        runSAPI6Test(data.sapi6Data);
    });

    group('SAPI8_cart_items_70', () => {
        runSAPI8Test(data.sapi8Data);
    });

    group('SAPI32_cart_by_id_70', () => {
        runSAPI32Test(data.sapi32Data);
    });

    group('SAPI33_create_carts', () => {
        runSAPI33Test(data.sapi33Data);
    });

    group('SAPI34_remove_cart_items', () => {
        runSAPI34Test(data.sapi34Data);
    });

    group('SAPI35_change_quantity_cart_items', () => {
        runSAPI35Test(data.sapi35Data);
    });
}
