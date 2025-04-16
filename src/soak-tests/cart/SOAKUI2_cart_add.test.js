import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import { createMetrics } from '../../utils/metric.util';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import { LoginPage } from '../../pages/yves/login.page';
import CartPage from '../../pages/yves/cart.page';
import exec from 'k6/execution';
import ProductPage from '../../pages/yves/product.page';
import { parseHTML } from 'k6/html';
import { sleep } from 'k6';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKUI2',
  group: 'Cart',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: ['SOAKUI2_post_add_to_cart'],
  thresholds: {
    SOAKUI2_post_add_to_cart: {
      soak: ['avg<300'],
    },
  },
};

export function setup() {
  const dynamicFixture = FixturesResolver.resolveFixture('customer', {
    customerCount: testConfiguration.rampVus,
    itemCount: 1,
    randomItems: true,
  });

  return dynamicFixture.getData();
}

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadSoakOptions(testConfiguration, metricThresholds);

export default function (data) {
  const vuId = exec.vu.idInTest - 1;
  const customerData = data[vuId];
  const email = customerData.customerEmail;
  const product = customerData.products[0];

  let password = null;
  if (EnvironmentUtil.getUseStaticFixtures()) {
    password = customerData.customerPassword;
  }

  let headers;
  const loginPage = new LoginPage(email, password);
  group('Login', () => {
    headers = loginPage.login();
  });

  let productDetailsResponse;
  group('Product Details', () => {
    const productPage = new ProductPage();
    productDetailsResponse = productPage.get(product.url);
  });

  let productDetailsForm = parseHTML(productDetailsResponse.body);
  const productDetailsFormToken = productDetailsForm.find('#add_to_cart_form__token').attr('value');

  group('Add to cart', () => {
    const cartPage = new CartPage(headers);
    const response = cartPage.addItem(product.sku, productDetailsFormToken);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });

  group('Logout', () => {
    loginPage.logout(headers);
  });

  sleep(10);
}
