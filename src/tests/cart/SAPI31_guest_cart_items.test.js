// tags: smoke, load, cart, SAPI, skip
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { ProductFixture } from '../../fixtures/product.fixture';
import GuestCartsResource from '../../resources/guest-carts.resource';

if (EnvironmentUtil.getRepositoryId() !== 'suite') {
  exec.test.abort('guest-carts endpoint is not supported in this repository');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI31',
  group: 'Cart',
  metrics: ['SAPI31_post_guest_cart_items'],
  thresholds: {
    SAPI31_post_guest_cart_items: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
      soak: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new ProductFixture({ productCount: 1 });

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const product = fixture.iterateData(data);
  const anonymousCustomerUniqueId = `ananymous-${exec.vu.iterationInScenario}`;

  group(testConfiguration.group, () => {
    const guestCartsResource = new GuestCartsResource(anonymousCustomerUniqueId);
    const response = guestCartsResource.addItem(null, product.sku, 1);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
