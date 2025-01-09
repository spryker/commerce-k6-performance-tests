import PaymentUtil from '../utils/payment.util';
import AbstractResource from './abstract.resource';

export default class CheckoutResource extends AbstractResource {
  constructor(idCart, email, bearerToken = null) {
    super(bearerToken);
    this.idCart = idCart;
    this.email = email;
  }

  checkout() {
    return this.postRequest('checkout', this._getCheckoutPayload());
  }

  _getCheckoutPayload() {
    const address = {
      salutation: 'Ms',
      email: this.email,
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
      isDefaultBilling: true,
    };

    return {
      data: {
        type: 'checkout',
        attributes: {
          customer: {
            salutation: 'Ms',
            email: this.email,
            firstName: 'SoniaK6',
            lastName: 'WagnerK6',
          },
          idCart: this.idCart,
          billingAddress: address,
          shippingAddress: address,
          payments: [
            {
              paymentMethodName: PaymentUtil.getPaymentMethodName(),
              paymentProviderName: PaymentUtil.getPaymentProviderName(),
            },
          ],
          shipment: {
            idShipmentMethod: 2,
          },
        },
      },
    };
  }
}
