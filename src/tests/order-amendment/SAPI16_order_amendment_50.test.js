import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import OrderAmendmentResource from '../../resources/order-amendment.resource';
import CartsResource from '../../resources/carts.resource';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() !== 'suite') {
  exec.test.abort('Order Amendment is not integrated into demo shops.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI16',
  group: 'Order Amendment',
  metrics: ['SAPI16_post_cart_reorder', 'SAPI17_delete_carts', 'SAPI18_post_checkout'],
  thresholds: {
    SAPI16_post_cart_reorder: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
    SAPI17_delete_carts: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
    SAPI18_post_checkout: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new CheckoutFixture({
    customerCount: testConfiguration.vus,
    cartCount: testConfiguration.iterations,
    itemCount: 50,
  });

  if (isSequentialSetup()) {
    return dynamicFixture.getData(testConfiguration.iterations, 1);
  }

  if (isConcurrentSetup()) {
    return dynamicFixture.getData();
  }
}

export default function (data) {
  const { customerEmail, quoteIds } = getCustomerData(data);
  const quoteIndex = getQuoteIndex(quoteIds);
  const idCart = quoteIds[quoteIndex];

  let bearerToken;
  let orderReference;
  let reorderedIdCart;

  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group('Checkout', () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    const responseJson = JSON.parse(response.body);
    orderReference = responseJson.data.attributes.orderReference;
  });

  const orderAmendmentResource = new OrderAmendmentResource(orderReference, bearerToken);
  group('Start Order Amendment', () => {
    const response = orderAmendmentResource.amendOrder();
    const responseJson = JSON.parse(response.body);
    metrics['SAPI16_post_cart_reorder'].add(response.timings.duration);
    reorderedIdCart = responseJson.data.id;
  });

  const cartsResource = new CartsResource(bearerToken);
  group('Cancel Order Amendment', () => {
    cartsResource.create('default', true);
    const response = cartsResource.delete(reorderedIdCart);
    metrics['SAPI17_delete_carts'].add(response.timings.duration);
  });

  group('Start Order Amendment', () => {
    const response = orderAmendmentResource.amendOrder();
    const responseJson = JSON.parse(response.body);
    reorderedIdCart = responseJson.data.id;
  });

  group('Finish Order Amendment', () => {
    const checkoutResource = new CheckoutResource(reorderedIdCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    metrics['SAPI18_post_checkout'].add(response.timings.duration);
  });
}

function getCustomerData(data) {
  let customerIndex;

  if (isSequentialSetup()) {
    customerIndex = exec.vu.iterationInScenario % data.length;
  } else if (isConcurrentSetup()) {
    customerIndex = (exec.vu.idInTest - 1) % data.length;
  }

  return data[customerIndex];
}

function getQuoteIndex(quoteIds) {
  return isSequentialSetup() ? 0 : exec.vu.iterationInScenario % quoteIds.length;
}

function isConcurrentSetup() {
  return testConfiguration.vus > 1 && testConfiguration.iterations === 1;
}

function isSequentialSetup() {
  return testConfiguration.vus === 1 && testConfiguration.iterations > 1;
}
