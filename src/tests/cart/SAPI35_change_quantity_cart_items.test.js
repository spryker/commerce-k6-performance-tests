// tags: smoke, load, cart, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';
import { CartFixture } from '../../fixtures/cart.fixture';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

export const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI35',
  group: 'Cart',
  metrics: ['SAPI35_patch_cart_items'],
  thresholds: {
    SAPI35_patch_cart_items: {
      smoke: ['avg<1400'],
      load: ['avg<2800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export { metrics, metricThresholds };
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: testConfiguration.iterations,
  itemCount: 70,
});

export function setup() {
  CartFixture.runConsoleCommands(['vendor/bin/console queue:worker:start --stop-when-empty']);

  return fixture.getData();
}

// Exported test function for reuse in suite
export function runTest(data) {
  const { customerEmail, idCart } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  const cartsResource = new CartsResource(bearerToken);
  let skuForUpdate;
  group('Gets customer cart info', () => {
    const response = cartsResource.get(idCart, ['items']);
    const bodyJson = JSON.parse(response.body);

    skuForUpdate = bodyJson.included[0].attributes.groupKey;
  });

  group(testConfiguration.group, () => {
    const response = cartsResource.updateItem(idCart, skuForUpdate, 2);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}

// Default export for running as standalone test
export default runTest;
