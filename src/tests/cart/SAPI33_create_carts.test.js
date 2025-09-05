// tags: smoke, load, cart, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import { CustomerFixture } from '../../fixtures/customer.fixture';
import CartsResource from '../../resources/carts.resource';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI33',
  group: 'Cart',
  metrics: ['SAPI33_post_carts'],
  thresholds: {
    SAPI33_post_carts: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CustomerFixture({ customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus() });

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail } = fixture.iterateData(data, exec.vu.idInTest);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.create(`Test cart ${exec.vu.idInTest}`);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
