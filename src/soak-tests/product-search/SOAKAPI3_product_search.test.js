import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';
import RandomUtil from '../../utils/random.util';
import { sleep } from 'k6';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKAPI3',
  group: 'Product Search',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: ['SOAKAPI3_get_search'],
  thresholds: {
    SOAKAPI3_get_search: {
      soak: ['avg<500'],
    },
  },
};

export function setup() {
  const dynamicFixture = FixturesResolver.resolveFixture('product', {
    productCount: 50,
  });

  return dynamicFixture.getData();
}

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadSoakOptions(testConfiguration, metricThresholds);

export default function (data) {
  const product = RandomUtil.getRandomItem(data);

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get({ sku: product.sku });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });

  sleep(1);
}
