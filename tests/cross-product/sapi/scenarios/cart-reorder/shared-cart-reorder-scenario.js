import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartReorderScenario extends AbstractScenario {
    execute(customerEmail, orderId) {
        let self = this;
        group('Cart Reorder', function () {
            self.haveReorder(customerEmail, orderId);
        });
    }

    haveReorder(customerEmail, orderId) {
        const cartReorderResponse = this.http.sendPostRequest(
            this.http.url`${this.getStorefrontApiBaseUrl()}/cart-reorder`,
            JSON.stringify(this._getCartReorderAttributes(orderId)),
            this.cartHelper.getParamsWithAuthorization(customerEmail),
            false
        );

        this.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);

        return JSON.parse(cartReorderResponse.body);
    }

    _getCartReorderAttributes(orderId) {
        return {
            data: {
                type: 'cart-reorder',
                attributes: {
                    orderReference: orderId
                }
            }
        }
    }
}
