import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    execute(sku, quantity) {
        let self = this;
        const cartId = self.cartHelper.haveCartWithProducts(0);
        const params = self.cartHelper.getParamsWithAuthorization();

        group('Checkout', function () {
            const addToCartResponse = self.cartHelper.addItemToCart(cartId, quantity, params, sku)
            self.assertResponseStatus(addToCartResponse, 201);
        });
    }
}
