// tags: smoke, load, cart, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';

export const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI5',
  group: 'Cart',
  metrics: ['SAPI5_get_carts_include_items'],
  thresholds: {
    SAPI5_get_carts_include_items: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export { metrics, metricThresholds };
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: 1,
  itemCount: 1,
});

export function setup() {
  return fixture.getData();
}

// Exported test function for reuse in suite
export function runTest(data) {
  const { customerEmail, idCart } = fixture.iterateData(data);

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

// Default export for running as standalone test
export default runTest;
