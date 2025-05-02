// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CartPage from '../../pages/yves/cart.page';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import IteratorUtil from '../../utils/iterator.util';
import exec from 'k6/execution';
import ConfigResolver from '../../utils/config-resolver.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/yves/login.page';
import ProductPage from '../../pages/yves/product.page';
import { parseHTML } from 'k6/html';
import { sleep } from 'k6';

const testConfiguration = new ConfigResolver({
  params: {
    id: 'S19',
    group: 'Cart',
    metrics: ['S19_post_cart_add'],
    thresholds: {
      S19_post_cart_add: {
        smoke: ['avg<300'],
        load: ['avg<600'],
      },
    },
  },
}).resolveConfig();

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = FixturesResolver.resolveFixture('customer', {
    customerCount: testConfiguration.vus,
    itemCount: 1,
    randomItems: true,
  });

  return dynamicFixture.getData();
}

export default function (data) {
  const customer = IteratorUtil.iterateData({ fixtureName: 'customer', data, vus: exec.vu.idInTest });

  const email = customer.customerEmail;
  const product = customer.products[0];

  let password = null;
  if (EnvironmentUtil.getUseStaticFixtures()) {
    password = customer.customerPassword;
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

  sleep(1);
}
