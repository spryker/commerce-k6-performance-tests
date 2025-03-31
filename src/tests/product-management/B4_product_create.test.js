import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/bo/login.page';
import ProductPage from '../../pages/bo/product.page';
import { parseHTML } from 'k6/html';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'B4',
  group: 'Product management',
  metrics: ['B4_get_product_add', 'B4_post_product_add'],
  vus: 1,
  iterations: 10,
  thresholds: {
    B4_get_product_add: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    B4_post_product_add: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export default function () {
  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage();
    headers = loginPage.login();
  });

  const productPage = new ProductPage(headers);

  let productAddFormToken;
  group('Get Product Add', () => {
    const productPageResponse = productPage.add();

    productAddFormToken = parseHTML(productPageResponse.body).find('#product_form_add__token').attr('value');

    metrics[testConfiguration.metrics[0]].add(productPageResponse.timings.duration);
  });

  group('Product Add Submit', () => {
    const productPageResponse = productPage.addSubmit(productAddFormToken);

    metrics[testConfiguration.metrics[1]].add(productPageResponse.timings.duration);
  });
}
