// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import AbstractProductsResource from '../../resources/abstract-products.resource';
import EnvironmentUtil from "../../utils/environment.util";
import exec from 'k6/execution';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI13',
  group: 'Product',
  metrics: ['SAPI13_get_abstract_products_all_includes'],
  thresholds: {
    SAPI13_get_abstract_products_all_includes: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
      soak: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = FullProductFixture.createFixture({
  productCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const product = fixture.iterateData(data, exec.vu.idInTest);

  group(testConfiguration.group, () => {
    const abstractProductsResource = new AbstractProductsResource();
    const response = abstractProductsResource.get(product.abstractSku, [
      'abstract-product-image-sets',
      'abstract-product-availabilities',
      'abstract-product-prices',
      'product-labels',
      'product-tax-sets',
      'product-options',
      'product-reviews',
      'category-nodes',
      'concrete-products',
      'concrete-product-image-sets',
      'concrete-product-availabilities',
      'concrete-product-prices',
    ]);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
