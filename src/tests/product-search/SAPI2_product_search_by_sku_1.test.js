// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';
import ConfigResolver from '../../utils/config-resolver.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import IteratorUtil from '../../utils/iterator.util';

const testConfiguration = new ConfigResolver({
  params: {
    id: 'SAPI2',
    group: 'Product Search',
    metrics: ['SAPI2_get_catalog_search'],
    thresholds: {
      SAPI2_get_catalog_search: {
        smoke: ['avg<400'],
        load: ['avg<800'],
      },
    },
  },
}).resolveConfig();

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = FixturesResolver.resolveFixture('product', {
    productCount: 100,
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
