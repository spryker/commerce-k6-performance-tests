import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import ProductPage from '../../pages/yves/product.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S8',
  group: 'Product',
  metrics: ['S8_get_product'],
  thresholds: {
    S8_get_product: {
      smoke: ['avg<300'],
      load: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new FullProductFixture({
    productCount: testConfiguration.vus,
    includes: {
      labels: 3,
      reviews: 10,
      options: 3,
    },
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = FullProductFixture.iterateData(data);

  group(testConfiguration.group, () => {
    const productPage = new ProductPage();
    const response = productPage.get(product.url);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
