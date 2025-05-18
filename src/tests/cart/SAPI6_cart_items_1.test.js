// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';
import { CartFixture } from '../../fixtures/cart.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI6',
  group: 'Cart',
  metrics: ['SAPI6_post_carts_items'],
  thresholds: {
    SAPI6_post_carts_items: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
      soak: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = CartFixture.createFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: 1,
  itemCount: 1,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, idCart, productSku } = fixture.iterateData(data, exec.vu.idInTest);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.addItem(idCart, productSku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}

