import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { ProductFixture } from '../../fixtures/product.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import CatalogPage from '../../pages/yves/catalog.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S2',
  group: 'Product Search',
  metrics: ['S2_get_search'],
  thresholds: {
    S2_get_search: {
      smoke: ['avg<200'],
      load: ['avg<200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new ProductFixture({
    productCount: testConfiguration.vus,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = ProductFixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogPage = new CatalogPage();
    const response = catalogPage.search(product);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
