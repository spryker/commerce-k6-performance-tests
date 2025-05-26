// tags: smoke, load
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
  id: 'SAPI32',
  group: 'Cart',
  metrics: ['SAPI32_get_carts_by_id'],
  thresholds: {
    SAPI32_get_carts_by_id: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: 1,
  itemCount: 70,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = fixture.iterateData(data, exec.vu.idInTest, 0);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.get(idCart, ['items']);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
