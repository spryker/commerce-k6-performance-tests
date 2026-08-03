// tags: smoke, load, soak, product-search, SAPI
import { group } from 'k6';
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
      smoke: ['avg<1100'],
      load: ['avg<2200'],
      soak: ['avg<2200'],
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

  // Warm-up: hit the measured endpoint once before the timed iterations. The first request
  // after a redeploy pays one-off warm-up costs and would otherwise skew the smoke avg.
  const warmupCategory = fixture.iterateData(data);
  new CatalogSearchResource().get({
    label: CategoryFixture.DEFAULT_PRODUCT_LABEL,
    color: CategoryFixture.DEFAULT_COLORS[0],
    brand: CategoryFixture.DEFAULT_BRANDS[0],
    category: warmupCategory.category_node.id_category_node,
    ipp: 36,
  });

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
