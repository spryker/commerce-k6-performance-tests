import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';
import exec from 'k6/execution';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI4',
  group: 'Cart',
  metrics: ['SAPI4_get_carts'],
  thresholds: {
    SAPI4_get_carts: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new CartFixture({
    customerCount: testConfiguration.vus,
    cartCount: 10,
    itemCount: 70,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail } = CartFixture.iterateData(data, exec.vu.idInTest, 0);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.all();

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
