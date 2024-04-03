import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedBrowserCheckoutScenario extends AbstractScenario {
  execute() {
    this.cartHelper.haveCartWithProducts(0);
    this.storefrontHelper.loginUser();

    let self = this;

    group('Checkout', function () {
      self.productPage();
      self.cartPage();
      self.checkoutPage();
      self.addressPage();
      self.shipmentPage();
      self.paymentPage();
      self.summaryPage();
    });
  }

  productPage() {
    //product page
    const productPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/${'stapelstuhl-mit-geschlossenem-ruecken-M83'}`);
    this.assertionsHelper.assertResponseStatus(productPageResponse, 200);
    this.assertionsHelper.assertResponseContainsText(productPageResponse, '<span itemprop="sku">657712</span>');

    // add to cart form submit
    const addToCartFormSubmitResponse = this.http.submitForm(productPageResponse, {
      formSelector: 'form[name="addToCartForm_657712-"]',
      fields: {
        'quantity': __ENV.numberOfItems,
      },
    });
    this.assertionsHelper.assertResponseStatus(addToCartFormSubmitResponse, 302);
  }

  cartPage() {
    this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/cart`);

    // TODO Items are obtained via AJAX request now, tests must be adjusted.
    // this.assertResponseBodyIncludes(cartPageResponse, '1 Items');
    // this.assertResponseBodyIncludes(cartPageResponse, 'FRIWA stackable chair - with closed back');
  }

  checkoutPage() {
    const checkoutResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout`, { redirects: 0});
    this.assertionsHelper.assertResponseStatus(checkoutResponse, 302);
  }

  addressPage() {
    //address
    const addressStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/address`);
    this.assertionsHelper.assertResponseContainsText(addressStepResponse, 'Delivery Address');

    //address form submit
    this.http.submitForm(addressStepResponse, {
      formSelector: 'form[name="addressesForm"]',
      fields: {
        'addressesForm[billingSameAsShipping]': '1' ,
        'checkout-full-addresses': 'company_business_unit_address_13',
        'addressesForm[shippingAddress][id_company_unit_address]': 13
      },
    });
  }

  shipmentPage() {
    const shipmentStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/shipment`);
    this.assertionsHelper.assertResponseContainsText(shipmentStepResponse, 'Shipment 1 of 1');

    //shipment submit form
    this.http.submitForm(shipmentStepResponse, {
      formSelector: 'form[name="shipmentCollectionForm"]',
      fields: {
        'shipmentCollectionForm[shipmentGroups][0][shipment][shipmentSelection]': 1
      },
    });
  }

  paymentPage() {
    const paymentStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/payment`);
    this.assertionsHelper.assertResponseContainsText(paymentStepResponse, 'Payment method');

    //payment submit form
    this.http.submitForm(paymentStepResponse, {
      formSelector: 'form[name="paymentForm"]',
      fields: this._getPaymentFormFields(),
    });
  }

  summaryPage() {
    const summaryStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/summary`);
    this.assertionsHelper.assertResponseContainsText(summaryStepResponse, 'Complete checkout');

    //summary submit form and place order
    this.http.submitForm(summaryStepResponse, {
      formSelector: 'form[name="summaryForm"]',
      fields: {
        'acceptTermsAndConditions': 1
      },
    });

    this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/place-order`, { redirects: 0});
    const successPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/success`);

    this.assertionsHelper.assertResponseContainsText(successPageResponse, 'Your order has been placed successfully.');
  }

  _getPaymentFormFields() {
    return {
      'paymentForm[paymentSelection]': 'dummyPaymentInvoice',
      'paymentForm[dummyPaymentInvoice][date_of_birth]:': '12.12.2000'
    };
  }
}
