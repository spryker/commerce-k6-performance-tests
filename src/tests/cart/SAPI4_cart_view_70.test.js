// tags: smoke, load, cart, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';
import exec from 'k6/execution';

export const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI4',
  group: 'Cart',
  metrics: ['SAPI4_get_carts'],
  thresholds: {
    SAPI4_get_carts: {
      smoke: ['avg<1200'],
      load: ['avg<2400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export { metrics, metricThresholds };
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: 10,
  itemCount: 70,
});

export function setup() {
  CartFixture.runConsoleCommands(['vendor/bin/console queue:worker:start --stop-when-empty']);

  const data = fixture.getData();

  // Warm-up: hit the measured endpoint once before the timed iterations. The first request
  // after a redeploy pays one-off warm-up costs and would otherwise skew the smoke avg.
  const { customerEmail } = fixture.iterateData(data, 1, 0);
  new CartsResource(AuthUtil.getInstance().getBearerToken(customerEmail)).all();

  return data;
}

// Exported test function for reuse in suite
export function runTest(data) {
  const { customerEmail } = fixture.iterateData(data, exec.vu.idInTest, 0);

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

// Default export for running as standalone test
export default runTest;
