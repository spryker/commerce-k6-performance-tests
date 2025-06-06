// tags: smoke, load, product-search, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CategoryFixture } from '../../fixtures/category.fixture';
import CatalogSearchResource from '../../resources/catalog-search.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI43',
  group: 'Product Search',
  metrics: ['SAPI43_get_category_search'],
  thresholds: {
    SAPI43_get_category_search: {
      smoke: ['avg<300'],
      load: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CategoryFixture({
  categoryCount: 1,
  productCount: 100,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const category = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get({
      category: category.category_node.id_category_node,
      ipp: 36,
    });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
