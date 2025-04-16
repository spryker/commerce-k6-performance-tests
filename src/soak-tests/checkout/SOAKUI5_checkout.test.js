import { group } from 'k6';
import { parseHTML } from 'k6/html';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import { LoginPage } from '../../pages/yves/login.page';
import CartPage from '../../pages/yves/cart.page';
import CheckoutPage from '../../pages/yves/checkout.page';
import { sleep } from 'k6';
import ProductPage from '../../pages/yves/product.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKUI5',
  group: 'Checkout',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: [
    'SOAKUI5_get_checkout_address',
    'SOAKUI5_post_checkout_address',
    'SOAKUI5_get_checkout_shipment',
    'SOAKUI5_post_checkout_shipment',
    'SOAKUI5_get_checkout_payment',
    'SOAKUI5_post_checkout_payment',
    'SOAKUI5_get_checkout_summary',
    'SOAKUI5_post_checkout_summary',
    'SOAKUI5_get_checkout_success',
    'SOAKUI5_get_place_order',
  ],
  thresholds: {
    SOAKUI5_get_checkout_address: {
      soak: ['avg<1500'],
    },
    SOAKUI5_post_checkout_address: {
      soak: ['avg<1500'],
    },
    SOAKUI5_get_checkout_shipment: {
      soak: ['avg<1300'],
    },
    SOAKUI5_post_checkout_shipment: {
      soak: ['avg<1300'],
    },
    SOAKUI5_get_checkout_payment: {
      soak: ['avg<1900'],
    },
    SOAKUI5_post_checkout_payment: {
      soak: ['avg<1900'],
    },
    SOAKUI5_get_checkout_summary: {
      soak: ['avg<2100'],
    },
    SOAKUI5_post_checkout_summary: {
      soak: ['avg<2100'],
    },
    SOAKUI5_get_checkout_success: {
      soak: ['avg<4700'],
    },
    SOAKUI5_get_place_order: {
      soak: ['avg<2200'],
    },
  },
};

export function setup() {
  const fixture = FixturesResolver.resolveFixture('customer', {
    customerCount: testConfiguration.rampVus,
    itemCount: 1,
    randomItems: false,
  });

  return fixture.getData();
}

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadSoakOptions(testConfiguration, metricThresholds);

export default function (data) {
  const vuId = exec.vu.idInTest - 1;
  const customer = data[vuId];

  const email = customer.customerEmail;
  const product = customer.products[0];

  let password = null;
  if (EnvironmentUtil.getUseStaticFixtures()) {
    password = customer.customerPassword;
  }

  let headers;
  const loginPage = new LoginPage(email, password);

  group('Login', () => {
    headers = loginPage.login();
  });

  let productDetailsResponse;
  group('Product Details', () => {
    const productPage = new ProductPage();
    productDetailsResponse = productPage.get(product.url);
  });

  let productDetailsForm = parseHTML(productDetailsResponse.body);
  const productDetailsFormToken = productDetailsForm.find('#add_to_cart_form__token').attr('value');

  group('Add to cart', () => {
    const cartPage = new CartPage(headers);
    cartPage.addItem(product.sku, productDetailsFormToken);

    sleep(1);
  });

  const checkoutPage = new CheckoutPage(headers);

  let checkoutAddressResponse;
  group('Checkout Address', () => {
    checkoutAddressResponse = checkoutPage.getCheckoutAddress();
    metrics['SOAKUI5_get_checkout_address'].add(checkoutAddressResponse.timings.duration);
  });

  let addressesForm = parseHTML(checkoutAddressResponse.body);
  const addressesFormToken = addressesForm.find('#addressesForm__token').attr('value');

  group('Checkout Address Submit', () => {
    const checkoutAddressSubmitResponse = checkoutPage.submitCheckoutAddress(addressesFormToken);
    metrics['SOAKUI5_post_checkout_address'].add(checkoutAddressSubmitResponse.timings.duration);
  });

  let checkoutShipmentResponse;
  group('Checkout Shipment', () => {
    checkoutShipmentResponse = checkoutPage.getCheckoutShipment();
    metrics['SOAKUI5_get_checkout_shipment'].add(checkoutShipmentResponse.timings.duration);
  });

  let shipmentForm = parseHTML(checkoutShipmentResponse.body);
  const shipmentFormToken = shipmentForm.find('#shipmentCollectionForm__token').attr('value');

  group('Checkout Shipment Submit', () => {
    const checkoutShipmentSubmitResponse = checkoutPage.submitCheckoutShipment(shipmentFormToken);
    metrics['SOAKUI5_post_checkout_shipment'].add(checkoutShipmentSubmitResponse.timings.duration);
  });

  let checkoutPaymentResponse;
  group('Checkout Payment', () => {
    checkoutPaymentResponse = checkoutPage.getCheckoutPayment();
    metrics['SOAKUI5_get_checkout_payment'].add(checkoutPaymentResponse.timings.duration);
  });

  let paymentForm = parseHTML(checkoutPaymentResponse.body);
  const paymentFormToken = paymentForm.find('#paymentForm__token').attr('value');

  group('Checkout Payment Submit', () => {
    const checkoutPaymentSubmitResponse = checkoutPage.submitCheckoutPayment(paymentFormToken);
    metrics['SOAKUI5_post_checkout_payment'].add(checkoutPaymentSubmitResponse.timings.duration);
  });

  let checkoutSummaryResponse;
  group('Checkout Summary', () => {
    checkoutSummaryResponse = checkoutPage.getCheckoutSummary();
    metrics['SOAKUI5_get_checkout_summary'].add(checkoutSummaryResponse.timings.duration);
  });

  let summaryForm = parseHTML(checkoutSummaryResponse.body);
  const summaryFormToken = summaryForm.find('#summaryForm__token').attr('value');

  group('Checkout Summary Submit', () => {
    const checkoutSummarySubmitResponse = checkoutPage.submitCheckoutSummary(summaryFormToken);
    metrics['SOAKUI5_post_checkout_summary'].add(checkoutSummarySubmitResponse.timings.duration);
  });

  group('Place order', () => {
    const placeOrderResponse = checkoutPage.getPlaceOrder();
    metrics['SOAKUI5_get_place_order'].add(placeOrderResponse.timings.duration);
  });

  group('Checkout Success', () => {
    const response = checkoutPage.getCheckoutSuccess();
    metrics['SOAKUI5_get_checkout_success'].add(response.timings.duration);
  });

  group('Logout', () => {
    loginPage.logout(headers);
  });

  sleep(1);
}
