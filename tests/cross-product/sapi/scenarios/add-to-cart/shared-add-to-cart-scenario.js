import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedAddToCartScenario extends AbstractScenario {
    execute() {
        let self = this;
        const cartId = self.cartHelper.haveCartWithProducts(0);

        group('Checkout', function () {
            const params = self.cartHelper.getParamsWithAuthorization();
            self.cartHelper.addItemToCart(cartId, __ENV.quantity, params, __ENV.sku)
        });
    }
}
