import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI32',
  group: 'Cart',
  metrics: ['SAPI32_get_carts_single_seventy_items'],
  thresholds: {
    SAPI32_get_carts_single_seventy_items: {
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
    cartCount: 1,
    itemCount: 70,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = CartFixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.getIncludeItems(idCart);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
