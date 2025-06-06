// tags: smoke, load, soak, product, S
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import ProductPage from '../../pages/yves/product.page';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import EnvironmentUtil from '../../utils/environment.util';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S8',
  group: 'Product',
  metrics: ['S8_get_product'],
  thresholds: {
    S8_get_product: {
      smoke: ['avg<300'],
      load: ['avg<600'],
      soak: ['avg<600'],
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
  const product = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const productPage = new ProductPage();
    const response = productPage.get(product.url);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
