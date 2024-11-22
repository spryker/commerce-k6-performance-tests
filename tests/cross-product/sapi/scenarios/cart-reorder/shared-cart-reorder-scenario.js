import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartReorderScenario extends AbstractScenario {
    execute(customerEmail, orderId) {
        let self = this;

        group('Cart Reorder', function () {
            const cartReorderResponse = self.http.sendPostRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/cart-reorder`,
                JSON.stringify(self._getCartReorderAttributes(orderId)),
                self.cartHelper.getParamsWithAuthorization(customerEmail),
                false
            );

            self.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);
        });
    }

    _getCartReorderAttributes(orderId) {
        return {
            data: {
                type: 'cart-reorder',
                attributes: {
                    orderReference: orderId,
                }
            }
        }
    }
}
