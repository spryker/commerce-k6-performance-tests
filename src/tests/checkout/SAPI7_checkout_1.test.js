import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI7',
  group: 'Checkout',
  metrics: ['SAPI7_post_checkout'],
  thresholds: {
    SAPI7_post_checkout: {
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
    itemCount: 1,
    defaultItemPrice: 10000, // Skipping global thresholds during checkout
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = CheckoutFixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}