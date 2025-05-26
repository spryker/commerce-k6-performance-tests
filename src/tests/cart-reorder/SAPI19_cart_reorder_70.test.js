// tags: smoke, load
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import CartReorderResource from '../../resources/cart-reorder.resource';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() !== 'suite' || EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('Cart Reorder is not integrated into demo shops or not applicable for soak tests.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI19',
  group: 'Cart Reorder',
  metrics: ['SAPI19_post_cart_reorder'],
  thresholds: {
    SAPI19_post_cart_reorder: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CheckoutFixture({
  customerCount: testConfiguration.vus,
  cartCount: testConfiguration.iterations,
  itemCount: 70,
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

  let orderReference;
  group('Checkout', () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    orderReference = JSON.parse(checkoutResource.checkout().body).data.attributes.orderReference;
  });

  group(testConfiguration.group, () => {
    const cartReorderResource = new CartReorderResource(orderReference, bearerToken);
    const response = cartReorderResource.reorder();
    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
