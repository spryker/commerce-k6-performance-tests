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

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI34',
  group: 'Cart',
  metrics: ['SAPI34_delete_cart_items'],
  thresholds: {
    SAPI34_delete_cart_items: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
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

export default function (data) {
  const { customerEmail, idCart } = fixture.iterateData(data, exec.vu.idInTest, 0);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  const cartsResource = new CartsResource(bearerToken);
  let skuForRemove;
  group('Gets customer cart info', () => {
    const response = cartsResource.get(idCart, ['items']);
    const bodyJson = JSON.parse(response.body);

    skuForRemove = bodyJson.included[0].attributes.sku;
  });

  group(testConfiguration.group, () => {
    const response = cartsResource.removeItem(idCart, skuForRemove);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
