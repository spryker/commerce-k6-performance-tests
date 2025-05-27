// tags: smoke, load
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import AuthUtil from '../../utils/auth.util';
import CheckoutResource from '../../resources/checkout.resource';
import { LoginPage } from '../../pages/yves/login.page';
import OrderPage from '../../pages/yves/order.page';
import exec from 'k6/execution';

if (EnvironmentUtil.getTestType() === 'soak') {
    exec.test.abort('Order cancellation is not applicable for soak tests.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S13',
  group: 'Order',
  metrics: ['S13_get_orders', 'S13_post_cancel_order'],
  thresholds: {
    S13_get_orders: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S13_post_cancel_order: {
      smoke: ['avg<2000'],
      load: ['avg<4000'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CheckoutFixture({
  customerCount: testConfiguration.vus,
  cartCount: testConfiguration.iterations,
  itemCount: 70,
  defaultItemPrice: 1000,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  let orderId;
  group('Place order', () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    const checkoutResponse = checkoutResource.checkout();
    orderId = JSON.parse(checkoutResponse.body).data.attributes.orderReference.replace('DE--', '');
  });

  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage(customerEmail);
    headers = loginPage.login();
  });

  const orderPage = new OrderPage(headers);

  group('View order history', () => {
    const response = orderPage.all();
    metrics['S13_get_orders'].add(response.timings.duration);
  });

  group('Cancel order', () => {
    const response = orderPage.cancel(orderId);
    metrics['S13_post_cancel_order'].add(response.timings.duration);
  });
}
