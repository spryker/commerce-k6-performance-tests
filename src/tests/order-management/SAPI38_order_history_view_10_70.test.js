// tags: smoke, load, order-management, SAPI
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import OrdersResource from '../../resources/orders.resource';
import exec from 'k6/execution';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('Order History View is not applicable for soak tests.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI38',
  group: 'Order',
  metrics: ['SAPI38_get_orders', 'SAPI39_get_orders_details'],
  thresholds: {
    SAPI38_get_orders: {
      smoke: ['avg<1500'],
      load: ['avg<800'],
    },
    SAPI39_get_orders_details: {
      smoke: ['avg<1200'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CheckoutFixture({
  customerCount: testConfiguration.vus,
  // One spare cart per customer for the setup warm-up order (iterations use carts 0..n-1).
  cartCount: testConfiguration.iterations + 1,
  itemCount: 70,
});

export function setup() {
  const data = fixture.getData();

  // Warm-up: place one order and hit both measured endpoints once before the timed iterations.
  // The first request after a redeploy pays one-off warm-up costs and would otherwise skew the smoke avg.
  const { customerEmail, quoteIds } = data[0];
  const warmupCartId = quoteIds[quoteIds.length - 1];
  const bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  new CheckoutResource(warmupCartId, customerEmail, bearerToken).checkout();

  const ordersResource = new OrdersResource(bearerToken);
  const ordersResponse = ordersResource.all();
  const warmupOrderId = JSON.parse(ordersResponse.body).data[0].id;
  ordersResource.get(warmupOrderId, ['order-shipments', 'concrete-products', 'abstract-products']);

  return data;
}

export default function (data) {
  const { customerEmail, idCart } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group('Place orders', () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    checkoutResource.checkout();
  });

  let orderId;
  group('Get orders', () => {
    const ordersResource = new OrdersResource(bearerToken);
    const response = ordersResource.all();

    orderId = JSON.parse(response.body).data[0].id;
    metrics['SAPI38_get_orders'].add(response.timings.duration);
  });

  group('Get order details', () => {
    const ordersResource = new OrdersResource(bearerToken);
    const response = ordersResource.get(orderId, ['order-shipments', 'concrete-products', 'abstract-products']);
    metrics['SAPI39_get_orders_details'].add(response.timings.duration);
  });
}
