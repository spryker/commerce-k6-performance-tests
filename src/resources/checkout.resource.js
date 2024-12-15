import PaymentUtil from '../utils/payment.util.js';
import AbstractResource from './abstract.resource.js';

export default class CheckoutResource extends AbstractResource {

    constructor(idCart, bearerToken = null) {
        super(bearerToken);
        this.idCart = idCart;
    }

    checkout() {
        return this.postRequest('checkout', this._getCheckoutPayload());
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
