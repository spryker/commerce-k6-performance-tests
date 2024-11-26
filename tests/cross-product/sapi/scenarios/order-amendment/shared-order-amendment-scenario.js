import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedOrderAmendmentScenario extends AbstractScenario {
    execute(customerEmail, orderId) {
        let self = this;
        group('Order Amendment', function () {
            self.haveOrderAmendment(customerEmail, orderId);
        });
    }

    haveOrderAmendment(customerEmail, orderId) {
        this._ensureOrderState(customerEmail, orderId, 'payment pending');

        const cartReorderResponse = this.http.sendPostRequest(
            this.http.url`${this.getStorefrontApiBaseUrl()}/cart-reorder`,
            JSON.stringify(this._getCartReorderAttributes(orderId)),
            this.cartHelper.getParamsWithAuthorization(customerEmail),
            false
        );

        this.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);

        return JSON.parse(cartReorderResponse.body);
    }

    _ensureOrderState(customerEmail, orderId, state, maxRetries = 5) {
        let retries = 0;
        let order;

        do {
            order = this._getOrder(customerEmail, orderId);
            if (order.data.attributes.itemStates[0] !== state) {
                this.dynamicFixturesHelper.haveConsoleCommands(['console oms:check-condition', 'console oms:check-timeout']);
            }
            retries++;
        } while (order.data.attributes.itemStates[0] !== state && retries < maxRetries);

        if (retries === maxRetries) {
            throw new Error(`Order state is not ${state} after ${maxRetries} retries`);
        }
    }

    _getOrder(customerEmail, orderId) {
        let self = this;
        const orderResponse = self.http.sendGetRequest(
            self.http.url`${self.getStorefrontApiBaseUrl()}/orders/${orderId}`,
            self.cartHelper.getParamsWithAuthorization(customerEmail),
            false
        );
        self.assertionsHelper.assertResponseStatus(orderResponse, 200);

        return JSON.parse(orderResponse.body);
    }

    _getCartReorderAttributes(orderId) {
        return {
            data: {
                type: 'cart-reorder',
                attributes: {
                    orderReference: orderId,
                    isAmendment: true
                }
            }
        }
    }
}
