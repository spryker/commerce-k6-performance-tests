import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI6',
  group: 'Cart',
  description: 'Adds an item to the cart',
  metrics: ['SAPI6_post_carts_items'],
  thresholds: {
    SAPI6_post_carts_items: {
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
    cartCount: testConfiguration.iterations,
    itemCount: 1,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart, productSku } = CartFixture.iterateData(data);

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
