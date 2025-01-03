import { group } from 'k6';
import AuthUtil from '../../utils/auth.util.js';
import OptionsUtil from '../../utils/options.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import { CheckoutFixture } from '../../fixtures/checkout.fixture.js';
import EnvironmentUtil from '../../utils/environment.util.js';
import { createMetrics } from '../../utils/metric.util.js';
import OrderAmendmentResource from '../../resources/order-amendment.resource.js';
import CartsResource from '../../resources/carts.resource.js';

const testConfiguration = {
  id: 'SAPI20',
  group: 'Order Amendment',
  metrics: ['SAPI20_start_order_amendment_70', 'SAPI20_cancel_order_amendment_70', 'SAPI20_finish_order_amendment_70'],
  thresholds: {
    SAPI20_start_order_amendment_70: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
    SAPI20_cancel_order_amendment_70: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
    SAPI20_finish_order_amendment_70: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const dynamicFixture = new CheckoutFixture({
  customerCount: EnvironmentUtil.getVus(),
  cartCount: EnvironmentUtil.getIterations(),
  itemCount: 70,
});

export function setup() {
  if (isSequentialSetup()) {
    return dynamicFixture.getData(EnvironmentUtil.getIterations(), 1);
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
    metrics['SAPI20_start_order_amendment_70'].add(response.timings.duration);
    reorderedIdCart = responseJson.data.id;
  });

  const cartsResource = new CartsResource(bearerToken);
  group('Cancel Order Amendment', () => {
    cartsResource.create('default', true);
    const response = cartsResource.delete(reorderedIdCart);
    metrics['SAPI20_cancel_order_amendment_70'].add(response.timings.duration);
  });

  group('Start Order Amendment', () => {
    const response = orderAmendmentResource.amendOrder();
    const responseJson = JSON.parse(response.body);
    reorderedIdCart = responseJson.data.id;
  });

  group('Finish Order Amendment', () => {
    const checkoutResource = new CheckoutResource(reorderedIdCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    metrics['SAPI20_finish_order_amendment_70'].add(response.timings.duration);
  });
}

function getCustomerData(data) {
  let customerIndex;

  if (isSequentialSetup()) {
    customerIndex = __ITER % data.length;
  } else if (isConcurrentSetup()) {
    customerIndex = (__VU - 1) % data.length;
  }

  return data[customerIndex];
}

function getQuoteIndex(quoteIds) {
  return isSequentialSetup() ? 0 : __ITER % quoteIds.length;
}

function isConcurrentSetup() {
  return EnvironmentUtil.getVus() > 1 && EnvironmentUtil.getIterations() === 1;
}

function isSequentialSetup() {
  return EnvironmentUtil.getVus() === 1 && EnvironmentUtil.getIterations() > 1;
}
