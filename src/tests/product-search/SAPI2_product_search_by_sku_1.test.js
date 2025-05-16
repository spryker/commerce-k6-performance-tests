// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import IteratorUtil from '../../utils/iterator.util';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI2',
  group: 'Product Search',
  metrics: ['SAPI2_get_catalog_search'],
  thresholds: {
    SAPI2_get_catalog_search: {
      smoke: ['avg<400'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = FullProductFixture.createFixture({
    productCount: testConfiguration.vus,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = IteratorUtil.iterateData({ fixtureName: 'product', data });

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get({ q: product.sku });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
