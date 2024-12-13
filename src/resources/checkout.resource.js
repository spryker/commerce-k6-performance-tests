import { check } from 'k6';
import http from 'k6/http';
import UrlUtil from '../utils/url.util.js';
import PaymentUtil from '../utils/payment.util.js';

export default class CheckoutResource {

    constructor(idCart, bearerToken = null) {
        this.idCart = idCart;
        this.bearerToken = bearerToken;
    }

    checkout() {
        const response = http.post(
            `${UrlUtil.getStorefrontApiUrl()}/checkout`,
            JSON.stringify(this._getCheckoutPayload()),
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': this.bearerToken
                },
            }
        );

        check(response, { 'Checkout successful.': (r) => r.status === 201 });

        return response;
    }

    _getCheckoutPayload() {
        const address = {
            salutation: 'Ms',
            email: 'soniaK6@spryker.com',
            firstName: 'SoniaK6',
            lastName: 'WagnerK6',
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
                        email: 'soniaK6@spryker.com',
                        firstName: 'SoniaK6',
                        lastName: 'WagnerK6'
                    },
                    idCart: this.idCart,
                    billingAddress: address,
                    shippingAddress: address,
                    payments: [
                        {
                            paymentMethodName: PaymentUtil.getPaymentMethodName(),
                            paymentProviderName: PaymentUtil.getPaymentProviderName()
                        }
                    ],
                    shipment: {
                        idShipmentMethod: 2
                    }
                }
            }
        }
    }
}
