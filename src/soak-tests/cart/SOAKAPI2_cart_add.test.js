import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import exec from 'k6/execution';
import { sleep } from 'k6';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKAPI2',
  group: 'Cart',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: ['SOAKAPI2_post_add_to_cart'],
  thresholds: {
    SOAKAPI2_post_add_to_cart: {
      soak: ['avg<300'],
    },
  },
};

export function setup() {
  const dynamicFixture = FixturesResolver.resolveFixture('customer', {
    customerCount: testConfiguration.rampVus,
    itemCount: 1,
    randomItems: true,
  });

  return dynamicFixture.getData();
}

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadSoakOptions(testConfiguration, metricThresholds);

export default function (data) {
  const vuId = exec.vu.idInTest - 1;
  const customerData = data[vuId];
  const email = customerData.customerEmail;
  const product = customerData.products[0];

  let bearerToken;
  group('Authorization', () => {
    if (EnvironmentUtil.getUseStaticFixtures()) {
      bearerToken = AuthUtil.getInstance().getBearerToken(email, customerData.customerPassword);
    } else {
      bearerToken = AuthUtil.getInstance().getBearerToken(email);
    }
  });

  let idCart;
  group('Retrieve carts', () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.create(`Cart-${vuId}`);

    idCart = JSON.parse(response.body).data.id;
  });

  group('Add to cart', () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.addItem(idCart, product.sku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });

  sleep(1);
}
