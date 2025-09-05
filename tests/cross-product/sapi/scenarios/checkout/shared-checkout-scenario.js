import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    execute(numberOfItems, isMpPaymentProvider = true) {
        let self = this;

        group('Checkout', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();
            const cartId = self.cartHelper.haveCartWithProducts(numberOfItems, '100429');

            const checkoutResponse = self.http.sendPostRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/checkout?include=orders`,
                JSON.stringify(self._getCheckoutData(cartId, self.customerHelper.getDefaultCustomerEmail(), isMpPaymentProvider)),
                requestParams,
                false
            );

            self.assertionsHelper.assertResponseStatus(checkoutResponse, 201);
        });
    }

    haveOrder(customerEmail, cartId, isMpPaymentProvider = true, thresholdTag = null) {
        const requestParams = this.cartHelper.getParamsWithAuthorization(customerEmail);
        if (thresholdTag) {
            requestParams.tags = { name: thresholdTag };
        }

        const checkoutResponse = this.http.sendPostRequest(
            this.http.url`${this.getStorefrontApiBaseUrl()}/checkout`,
            JSON.stringify(this._getCheckoutData(cartId, customerEmail, isMpPaymentProvider)),
            requestParams,
            false
        );

        this.assertionsHelper.assertResponseStatus(checkoutResponse, 201);

        try {
            return JSON.parse(checkoutResponse.body);
        } catch (e) {
            throw Error('Failed to parse response during SharedCheckoutScenario::placeOrder()');
        }
    }

    _getCheckoutData(cartId, defaultCustomerEmail = this.customerHelper.getDefaultCustomerEmail(), isMpPaymentProvider = true) {
        const address = {
            salutation: 'Ms',
            email: defaultCustomerEmail,
            firstName: 'sonia',
            lastName: 'wagner',
            address1: 'West road',
            address2: '212',
            address3: '',
            zipCode: '61000',
            city: 'Berlin',
            iso2Code: 'DE',
            company: 'Spryker',
            phone: '+380669455897',
            isDefaultShipping: true,
            isDefaultBilling: true
        };

        return {
            data: {
                type: 'checkout',
                attributes: {
                    customer: {
                        salutation: 'Ms',
                        email: defaultCustomerEmail,
                        firstName: 'Sonia',
                        lastName: 'Wagner'
                    },
                    idCart: cartId,
                    billingAddress: address,
                    shippingAddress: address,
                    payments: [
                        {
                            paymentMethodName: 'Invoice',
                            paymentProviderName: this._getPaymentProviderName(isMpPaymentProvider)
                        }
                    ],
                    shipment: {
                        idShipmentMethod: 2
                    }
                }
            }
        }
    }

    _getPaymentProviderName(isMpPaymentProvider = true) {
        return isMpPaymentProvider ? 'DummyMarketplacePayment' : 'DummyPayment';
    }
}
