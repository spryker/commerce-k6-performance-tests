import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import RandomUtil from '../../utils/random.util';
import ProductPage from '../../pages/yves/product.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKUI4',
  group: 'Product',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: ['SOAKUI4_get_product'],
  thresholds: {
    SOAKUI4_get_product: {
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

  group('Product details', () => {
    const productPage = new ProductPage();
    const response = productPage.get(product.url);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
