// tags: smoke, load
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { ProductFixture } from '../../fixtures/product.fixture';
import EnvironmentUtil from '../../utils/environment.util';
import ConcreteProductsResource from '../../resources/concrete-products.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI3',
  group: 'Product Details',
  metrics: ['SAPI3_get_concrete_products'],
  thresholds: {
    SAPI3_get_concrete_products: {
      smoke: ['avg<400'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new ProductFixture({
    productCount: 1,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = ProductFixture.iterateData(data);

  group(testConfiguration.group, () => {
    const concreteProductsResource = new ConcreteProductsResource();
    const response = concreteProductsResource.get(product.sku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
