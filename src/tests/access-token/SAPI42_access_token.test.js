// tags: smoke, load, soak, access-token, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CustomerFixture } from '../../fixtures/customer.fixture';
import AccessTokensResource from '../../resources/access-tokens.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI41',
  group: 'Access Token',
  metrics: ['SAPI42_post_access_tokens'],
  thresholds: {
    SAPI42_post_access_tokens: {
      smoke: ['avg<1900'],
      load: ['avg<3800'],
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
