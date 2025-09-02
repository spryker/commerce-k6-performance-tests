// tags: smoke, load, quote-request, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import QuoteRequestsResource from '../../resources/quote-requests.resource';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI40',
  group: 'Quote Request',
  metrics: ['SAPI40_post_quote_requests'],
  thresholds: {
    SAPI40_post_quote_requests: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus,
  cartCount: testConfiguration.iterations,
  itemCount: 70,
  isCompanyUser: true,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, idCart } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const quoteRequestsResource = new QuoteRequestsResource(bearerToken);
    const response = quoteRequestsResource.create(idCart);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
