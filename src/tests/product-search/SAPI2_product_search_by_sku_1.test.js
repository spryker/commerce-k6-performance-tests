import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { ProductFixture } from '../../fixtures/product.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI2',
  group: 'Product Search',
  metrics: ['SAPI2_get_catalog_search'],
  minimumProductsCount: 100,
  thresholds: {
    SAPI2_get_catalog_search: {
      smoke: ['avg<200'],
      load: ['avg<400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new ProductFixture({
    productCount: testConfiguration.minimumProductsCount,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = ProductFixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get(product.sku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
