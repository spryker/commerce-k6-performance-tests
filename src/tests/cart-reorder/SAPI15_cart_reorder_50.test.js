import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import CartReorderResource from '../../resources/cart-reorder.resource';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI15',
  group: 'Cart Reorder',
  metrics: ['SAPI15_post_cart_reorder'],
  thresholds: {
    'SAPI15_post_cart_reorder': {
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

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = CheckoutFixture.iterateData(data);

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
