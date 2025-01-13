import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { ProductFixture } from '../../fixtures/product.fixture';
import CatalogPage from '../../pages/catalog.page';
import { check } from 'k6';
import EnvironmentUtil from '../../utils/environment.util';

const testConfiguration = {
  id: 'S2',
  group: 'Product Search',
  metrics: ['S2_get_search'],
  thresholds: {
    'S2_get_search': {
      smoke: ['avg<200'],
      load: ['avg<200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);
const dynamicFixture = new ProductFixture({ productCount: EnvironmentUtil.getVus() });

export function setup() {
  return dynamicFixture.getData();
}

export default function (data) {
  const product = dynamicFixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogPage = new CatalogPage();
    const response = catalogPage.search(product.sku);

    check(response, {
      'Catalog search was successful': (r) => r.status === 200 && r.body && r.body.includes(product.name),
    });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
