import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';

export default class CheckoutPage extends AbstractPage {
  constructor(headers) {
    super();
    this.headers = headers;
  }

  getCheckout() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout`, {
      headers: this.headers,
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Checkout was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  getCheckoutAddress() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/address`, {
      headers: this.headers,
      redirects: 0,
    });

    if (response.status === 302) {
      console.log(response);
    }

    addErrorToCounter(
      check(response, {
        'Checkout address was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  getCheckoutShipment() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/shipment`, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        'Checkout shipment was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  getCheckoutPayment() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/payment`, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        'Checkout payment was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  getCheckoutSummary() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/summary`, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        'Checkout summary was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  getPlaceOrder() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/place-order`, {
      headers: this.headers,
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Place order was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  getCheckoutSuccess() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/success`, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        'Checkout success was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  submitCheckoutAddress(token) {
    const payload = this._getAddressFormPayload(token);
    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/checkout/address`, payload, {
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Checkout address submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  submitCheckoutShipment(token) {
    const payload = this._getShipmentFormPayload(token);
    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/checkout/shipment`, payload, {
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Checkout shipment submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  submitCheckoutPayment(token) {
    const payload = this._getPaymentFormPayload(token);
    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/checkout/payment`, payload, {
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Checkout payment submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  submitCheckoutSummary(token) {
    const payload = this._getCheckoutSummaryPayload(token);
    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/checkout/summary`, payload, {
      headers: {
        ...this.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirects: 0,
    });

    addErrorToCounter(
      check(response, {
        'Checkout summary submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  _getAddressFormPayload(token) {
    let payload = {
      'checkout-full-addresses': 0,
      'addressesForm[shippingAddress][id_customer_address]': 0,
      'addressesForm[shippingAddress][id_company_unit_address]': 0,
      'addressesForm[shippingAddress][salutation]': 'Ms',
      'addressesForm[shippingAddress][first_name]': 'Sonia',
      'addressesForm[shippingAddress][last_name]': 'Wagner',
      'addressesForm[shippingAddress][company]': 'Spryker Systems GmbH',
      'addressesForm[shippingAddress][address1]': 'Kirncher Str.',
      'addressesForm[shippingAddress][address2]': '7',
      'addressesForm[shippingAddress][address3]': '',
      'addressesForm[shippingAddress][zip_code]': '10247',
      'addressesForm[shippingAddress][city]': 'Berlin',
      'addressesForm[shippingAddress][iso2_code]': 'DE',
      'addressesForm[shippingAddress][phone]': '4902890031',
      'addressesForm[billingSameAsShipping]': 1,
      'addressesForm[billingAddress][id_customer_address]': '',
      'addressesForm[billingAddress][id_company_unit_address]': 0,
      'addressesForm[billingAddress][salutation]': 'Ms',
      'addressesForm[billingAddress][first_name]': 'Sonia',
      'addressesForm[billingAddress][last_name]': 'Wagner',
      'addressesForm[billingAddress][company]': 'Spryker Systems GmbH',
      'addressesForm[billingAddress][address1]': 'Kirncher Str.',
      'addressesForm[billingAddress][address2]': '7',
      'addressesForm[billingAddress][address3]': '',
      'addressesForm[billingAddress][zip_code]': '10247',
      'addressesForm[billingAddress][city]': 'Berlin',
      'addressesForm[billingAddress][iso2_code]': 'DE',
      'addressesForm[billingAddress][phone]': '4902890031',
      'addressesForm[isMultipleShipmentEnabled]': '',
      'addressesForm[_token]': token,
    };

    if (EnvironmentUtil.getRepositoryId() === 'suite') {
      payload['addressesForm[shipmentType][key]'] = 'delivery';
      payload['addressesForm[servicePoint][uuid]'] = '';
    }

    return payload;
  }

  _getShipmentFormPayload(token) {
    return {
      'shipmentCollectionForm[shipmentGroups][0][shipment][shipmentSelection]': 1,
      'shipmentCollectionForm[_token]': token,
    };
  }

  _getPaymentFormPayload(token) {
    switch (EnvironmentUtil.getRepositoryId()) {
      case 'b2b-mp':
        return this._getMarketplacePaymentFormPayload(token);
      default:
        return this._getPaymentFormPayloadDefault(token);
    }
  }

  _getMarketplacePaymentFormPayload(token) {
    return {
      'paymentForm[paymentSelection]': 'dummyMarketplacePaymentInvoice',
      'paymentForm[dummyMarketplacePaymentInvoice][dateOfBirth]': '11.11.1991',
      'paymentForm[_token]': token,
    };
  }

  _getPaymentFormPayloadDefault(token) {
    return {
      'paymentForm[paymentSelection]': 'dummyPaymentInvoice',
      'paymentForm[dummyPaymentInvoice][date_of_birth]': '11.11.1991',
      'paymentForm[_token]': token,
    };
  }

  _getCheckoutSummaryPayload(token) {
    return {
      acceptTermsAndConditions: 1,
      'summaryForm[_token]': token,
    };
  }
}
