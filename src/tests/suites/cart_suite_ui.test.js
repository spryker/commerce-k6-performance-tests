// tags: smoke, load, soak, cart, S
// Combined UI test suite: All UI tests from the cart folder
import { group } from 'k6';
import { // Import S18 test components
    options as s18Options,
    setup as s18Setup,
    runTest as runS18Test
} from '../cart/S18_cart_view_70.test.js';
import { // Import S19 test components
    options as s19Options,
    setup as s19Setup,
    runTest as runS19Test
} from '../cart/S19_add_to_cart.test.js';

// Merge options from both tests
export const options = {
    ...s18Options,
    ...s19Options,
    thresholds: {
        ...s18Options.thresholds,
        ...s19Options.thresholds,
    },
};

export function setup() {
    return {
        s18Data: s18Setup(),
        s19Data: s19Setup(),
    };
}

export default function (data) {
    group('S18_cart_view_70_items', () => {
        runS18Test(data.s18Data);
    });

    group('S19_add_to_cart_one_product', () => {
        runS19Test(data.s19Data);
    });
}
