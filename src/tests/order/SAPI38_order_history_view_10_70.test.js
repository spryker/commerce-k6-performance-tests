import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI38',
  group: 'Order',
  metrics: ['SAPI38_get_orders', 'SAPI38_get_orders_details'],
  thresholds: {
    SAPI38_get_orders: {
      smoke: ['avg<400'],
      load: ['avg<800'],
    },
    SAPI38_get_orders_details: {
      smoke: ['avg<400'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new CheckoutFixture({
    customerCount: testConfiguration.vus,
    cartCount: 10,
    itemCount: 70,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = CheckoutFixture.iterateData(data);

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
    const response = ordersResource.get();

    orderId = JSON.parse(response.body).data[0].id;
    metrics['SAPI38_get_orders'].add(response.timings.duration);
  });

  group('Get order details', () => {
    const ordersResource = new OrdersResource(bearerToken);
    const response = ordersResource.getDetails(orderId, ['order-shipments', 'concrete-products', 'abstract-products']);
    metrics['SAPI38_get_orders_details'].add(response.timings.duration);
  });
}
