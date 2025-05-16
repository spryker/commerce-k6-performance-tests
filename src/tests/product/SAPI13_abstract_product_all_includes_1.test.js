// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import IteratorUtil from '../../utils/iterator.util';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import AbstractProductsResource from '../../resources/abstract-products.resource';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI13',
  group: 'Product',
  metrics: ['SAPI13_get_abstract_products_all_includes'],
  thresholds: {
    SAPI13_get_abstract_products_all_includes: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = FullProductFixture.createFixture({
    productCount: testConfiguration.vus,
    includes: testConfiguration.includes,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = IteratorUtil.iterateData({ fixtureName: 'product', data });

  group(testConfiguration.group, () => {
    const abstractProductsResource = new AbstractProductsResource();
    const response = abstractProductsResource.get(product.abstractSku, [
      'abstract-product-image-sets',
      'concrete-products',
      'abstract-product-availabilities',
      'abstract-product-prices',
      'category-nodes',
      'product-labels',
      'product-tax-sets',
      'product-reviews',
      'product-options',
    ]);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
