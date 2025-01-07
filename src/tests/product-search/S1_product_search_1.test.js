import { group } from 'k6';
import OptionsUtil from '../../utils/options.util.js';
import { createMetrics } from '../../utils/metric.util.js';
import { ProductFixture } from '../../fixtures/product.fixture.js';

const testConfiguration = {
  id: 'S1',
  group: 'Product Search',
  metrics: ['S1_product_search_1'],
  thresholds: {
    S1_product_search_1: {
      smoke: ['avg<447'],
      load: ['avg<447'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const dynamicFixture = new ProductFixture({productCount: 2});

export function setup() {
  const data = dynamicFixture.getData();
  console.log(dynamicFixture.getData());
  return dynamicFixture.getData();
}

export default function (data) {

  // const { customerEmail, idCart } = dynamicFixture.iterateData(data);
  //
  // let bearerToken;
  // group('Authorization', () => {
  //   bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  // });
  //
  // group(testConfiguration.group, () => {
  //   const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
  //   const response = checkoutResource.checkout();
  //   metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  // });
}
