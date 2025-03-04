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
  metrics: ['SAPI6_get_carts_items'],
  thresholds: {
    SAPI6_get_carts_items: {
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
    cartCount: 0,
    itemCount: 1,
    emptyCartCount: testConfiguration.iterations,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idEmptyCart, productSku } = CartFixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.postCartsItems(idEmptyCart, productSku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
