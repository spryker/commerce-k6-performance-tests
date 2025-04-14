import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import CartPage from '../../pages/yves/cart.page';
import { ProductFixture } from '../../fixtures/product.fixture';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S19',
  group: 'Cart',
  metrics: ['S19_post_cart_add'],
  thresholds: {
    S19_post_cart_add: {
      smoke: ['avg<300'],
      load: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new ProductFixture({
    productCount: testConfiguration.vus,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const product = ProductFixture.iterateData(data);

  group('Add to cart', () => {
    const cartPage = new CartPage();
    const response = cartPage.addItem(product.sku);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
