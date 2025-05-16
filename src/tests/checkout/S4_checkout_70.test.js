// tags: smoke, load, soak
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import { LoginPage } from '../../pages/yves/login.page';
import CheckoutPage from '../../pages/yves/checkout.page';
import { parseHTML } from 'k6/html';
import { group } from 'k6';
import { CustomerFixture } from '../../fixtures/customer.fixture';
import IteratorUtil from '../../utils/iterator.util';
import exec from 'k6/execution';
import ProductPage from '../../pages/yves/product.page';
import CartPage from '../../pages/yves/cart.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S4',
  group: 'Checkout',
  metrics: [
    'S4_get_checkout',
    'S4_get_checkout_address',
    'S4_post_checkout_address',
    'S4_get_checkout_shipment',
    'S4_post_checkout_shipment',
    'S4_get_checkout_payment',
    'S4_post_checkout_payment',
    'S4_get_checkout_summary',
    'S4_post_checkout_summary',
    'S4_get_checkout_success',
    'S4_get_place_order',
  ],
  thresholds: {
    S4_get_checkout: {
      smoke: ['avg<900'],
      load: ['avg<1800'],
    },
    S4_get_checkout_address: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_post_checkout_address: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_checkout_shipment: {
      smoke: ['avg<650'],
      load: ['avg<1300'],
    },
    S4_post_checkout_shipment: {
      smoke: ['avg<650'],
      load: ['avg<1300'],
    },
    S4_get_checkout_payment: {
      smoke: ['avg<950'],
      load: ['avg<1900'],
    },
    S4_post_checkout_payment: {
      smoke: ['avg<950'],
      load: ['avg<1900'],
    },
    S4_get_checkout_summary: {
      smoke: ['avg<1050'],
      load: ['avg<2100'],
    },
    S4_post_checkout_summary: {
      smoke: ['avg<1050'],
      load: ['avg<2100'],
    },
    S4_get_checkout_success: {
      smoke: ['avg<2850'],
      load: ['avg<4700'],
    },
    S4_get_place_order: {
      smoke: ['avg<1100'],
      load: ['avg<2200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  // Why fixture are different?
  if (EnvironmentUtil.getTestType() === 'soak') {
    const fixture = CustomerFixture.createFixture({
      customerCount: testConfiguration.vus,
      itemCount: 1,
    });

    return fixture.getData();
  }

  const dynamicFixture = new CartFixture({
    customerCount: testConfiguration.vus,
    cartCount: testConfiguration.iterations,
    itemCount: 70,
    defaultItemPrice: 1000,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  let headers;
  if (EnvironmentUtil.getTestType() === 'soak') {
    headers = getCustomerWithCartSoak(data);
  } else {
    headers = getCustomerWithCartSmokeLoad(data);
  }

  const checkoutPage = new CheckoutPage(headers);

  group('Checkout', () => {
    const checkoutResponse = checkoutPage.getCheckout();
    metrics['S4_get_checkout'].add(checkoutResponse.timings.duration);
  });

  let checkoutAddressResponse;
  group('Checkout Address', () => {
    checkoutAddressResponse = checkoutPage.getCheckoutAddress();
    metrics['S4_get_checkout_address'].add(checkoutAddressResponse.timings.duration);
  });

  let addressesForm = parseHTML(checkoutAddressResponse.body);
  const addressesFormToken = addressesForm.find('#addressesForm__token').attr('value');

  group('Checkout Address Submit', () => {
    const checkoutAddressSubmitResponse = checkoutPage.submitCheckoutAddress(addressesFormToken);
    metrics['S4_post_checkout_address'].add(checkoutAddressSubmitResponse.timings.duration);
  });

  let checkoutShipmentResponse;
  group('Checkout Shipment', () => {
    checkoutShipmentResponse = checkoutPage.getCheckoutShipment();
    metrics['S4_get_checkout_shipment'].add(checkoutShipmentResponse.timings.duration);
  });

  let shipmentForm = parseHTML(checkoutShipmentResponse.body);
  const shipmentFormToken = shipmentForm.find('#shipmentCollectionForm__token').attr('value');

  group('Checkout Shipment Submit', () => {
    const checkoutShipmentSubmitResponse = checkoutPage.submitCheckoutShipment(shipmentFormToken);
    metrics['S4_post_checkout_shipment'].add(checkoutShipmentSubmitResponse.timings.duration);
  });

  let checkoutPaymentResponse;
  group('Checkout Payment', () => {
    checkoutPaymentResponse = checkoutPage.getCheckoutPayment();
    metrics['S4_get_checkout_payment'].add(checkoutPaymentResponse.timings.duration);
  });

  let paymentForm = parseHTML(checkoutPaymentResponse.body);
  const paymentFormToken = paymentForm.find('#paymentForm__token').attr('value');

  group('Checkout Payment Submit', () => {
    const checkoutPaymentSubmitResponse = checkoutPage.submitCheckoutPayment(paymentFormToken);
    metrics['S4_post_checkout_payment'].add(checkoutPaymentSubmitResponse.timings.duration);
  });

  let checkoutSummaryResponse;
  group('Checkout Summary', () => {
    checkoutSummaryResponse = checkoutPage.getCheckoutSummary();
    metrics['S4_get_checkout_summary'].add(checkoutSummaryResponse.timings.duration);
  });

  let summaryForm = parseHTML(checkoutSummaryResponse.body);
  const summaryFormToken = summaryForm.find('#summaryForm__token').attr('value');

  group('Checkout Summary Submit', () => {
    const checkoutSummarySubmitResponse = checkoutPage.submitCheckoutSummary(summaryFormToken);
    metrics['S4_post_checkout_summary'].add(checkoutSummarySubmitResponse.timings.duration);
  });

  group('Place order', () => {
    const placeOrderResponse = checkoutPage.getPlaceOrder();
    metrics['S4_get_place_order'].add(placeOrderResponse.timings.duration);
  });

  group('Checkout Success', () => {
    const response = checkoutPage.getCheckoutSuccess();
    metrics['S4_get_checkout_success'].add(response.timings.duration);
  });
}

function getCustomerWithCartSmokeLoad(data) {
  const customer = IteratorUtil.iterateData({
    fixtureName: 'cart',
    data,
    vus: exec.vu.idInTest,
  });

  const loginPage = new LoginPage(customer.customerEmail);
  const headers = loginPage.login();

  return headers;
}

function getCustomerWithCartSoak(data) {
  const customer = IteratorUtil.iterateData({
    fixtureName: 'customer',
    data,
    vus: exec.vu.idInTest,
  });

  const product = customer.products[0];

  let loginPage;
  if (EnvironmentUtil.getUseStaticFixtures()) {
    loginPage = new LoginPage(customer.customerEmail, customer.customerPassword);
  } else {
    loginPage = new LoginPage(customer.customerEmail);
  }

  const headers = loginPage.login();

  let productDetailsResponse;
  group('Product Details', () => {
    const productPage = new ProductPage();
    productDetailsResponse = productPage.get(product.url);
  });

  let productDetailsForm = parseHTML(productDetailsResponse.body);
  const productDetailsFormToken = productDetailsForm.find('#add_to_cart_form__token').attr('value');

  group('Add to cart', () => {
    const cartPage = new CartPage(headers);
    cartPage.addItem(product.sku, productDetailsFormToken, product.productOfferReference);
  });

  return headers;
}
