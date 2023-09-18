import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Checkout', function () {
            self.checkoutWith1Item();
            self.checkoutWith70Items();
        });
    }

    checkoutWith1Item() {
        let self = this;

        const cartUuid = self.cartHelper.haveCartWithProducts(0);
        const response = this.checkout(cartUuid, 1, __ENV.sku);

        self.assertResponseStatus(response, 201);
    }

    checkoutWith70Items() {
        let self = this;

        const cartUuid = self.cartHelper.haveCartWithProducts(0);
        const response = this.checkout(cartUuid, 70, __ENV.sku);

        self.assertResponseStatus(response, 201);
    }

    checkout(cartId, quantity, sku, merchantReference = 'MER000008') {
        return this.http.sendPostRequest(
            this.http.url`${this.cartHelper.getCartsUrl()}/${cartId}/items`,
            JSON.stringify({
                data: {
                    type: 'items',
                    attributes: {
                        sku: sku,
                        quantity: quantity,
                        merchantReference: merchantReference
                    }
                }
            }),
            this.cartHelper.getParamsWithAuthorization(),
            false
        );
    }
}
