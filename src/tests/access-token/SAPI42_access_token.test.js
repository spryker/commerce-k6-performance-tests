// tags: smoke, load, soak, access-token, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util.js';
import { createMetrics } from '../../utils/metric.util.js';
import EnvironmentUtil from '../../utils/environment.util.js';
import { CustomerFixture } from '../../fixtures/customer.fixture.js';
import AccessTokensResource from '../../resources/access-tokens.resource.js';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI41',
  group: 'Discount',
  metrics: ['SAPI42_post_access_tokens'],
  thresholds: {
    SAPI42_post_access_tokens: {
      smoke: ['avg<400'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = CustomerFixture.createFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail } = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const accessTokensResource = new AccessTokensResource();
    const response = accessTokensResource.get(customerEmail);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
