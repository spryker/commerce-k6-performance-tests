// tags: smoke, load, soak, product, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';
import ConcreteProductsResource from '../../resources/concrete-products.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI12',
  group: 'Product',
  metrics: ['SAPI12_get_concrete_products_all_includes'],
  thresholds: {
    SAPI12_get_concrete_products_all_includes: {
      smoke: ['avg<700'],
      load: ['avg<1200'],
      soak: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = FullProductFixture.createFixture({
  productCount: 1,
  additionalConcreteCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const product = fixture.iterateData(data, exec.vu.idInTest);

  group(testConfiguration.group, () => {
    const concreteProductsResource = new ConcreteProductsResource();
    const response = concreteProductsResource.get(product.sku, [
      'concrete-product-image-sets',
      'concrete-product-availabilities',
      'concrete-product-prices',
      'product-labels',
      'product-tax-sets',
      'product-options',
      'product-reviews',
      'category-nodes',
      'abstract-products',
      'abstract-product-image-sets',
      'abstract-product-availabilities',
      'abstract-product-prices',
    ]);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
