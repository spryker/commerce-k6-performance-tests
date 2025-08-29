// tags: smoke, load, soak, product-search, SAPI
import { group, sleep } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';
import EnvironmentUtil from '../../utils/environment.util';
import { CategoryFixture } from '../../fixtures/category.fixture';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI14',
  group: 'Product Search',
  metrics: ['SAPI14_get_catalog_search'],
  thresholds: {
    SAPI14_get_catalog_search: {
      smoke: ['avg<400'],
      load: ['avg<800'],
      soak: ['avg<800'],
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
  const data = fixture.getData();
  sleep(5);

  return data;
}

export default function (data) {
  const category = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get({
      label: CategoryFixture.DEFAULT_PRODUCT_LABEL,
      color: CategoryFixture.DEFAULT_COLORS[Math.floor(Math.random() * CategoryFixture.DEFAULT_COLORS.length)],
      brand: CategoryFixture.DEFAULT_BRANDS[Math.floor(Math.random() * CategoryFixture.DEFAULT_BRANDS.length)],
      category: category.category_node.id_category_node,
      ipp: 36,
    });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
