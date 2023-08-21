import { executeCartsScenario } from './sapi/tests/cart/B2B-MP-SAPI4-carts.js';
import { executeSharedCartScenario } from './sapi/tests/cart/B2B-MP-SAPI5-cart.js';
import { executeProductDetailsScenario } from './sapi/tests/product-details/B2B-MP-SAPI3-product-details.js';
import { executeProductSearchScenario } from './sapi/tests/product-search/B2B-MP-SAPI2-product-search.js';
import { executeHomepageScenario } from './storefront/tests/homepage/B2B-MP-S1-homepage.js';
import { group } from 'k6';

export default function () {

        executeProductSearchScenario();
        executeHomepageScenario();
        executeProductDetailsScenario();

        group('Cart', function () {
                executeCartsScenario();
                executeSharedCartScenario();
        });
}
