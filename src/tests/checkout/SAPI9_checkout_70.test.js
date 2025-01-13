import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';

const testConfiguration = {
  id: 'SAPI9',
  group: 'Checkout',
  metrics: ['SAPI9_post_checkout'],
  thresholds: {
    'SAPI9_post_checkout': {
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
  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = dynamicFixture.iterateData(data);

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
