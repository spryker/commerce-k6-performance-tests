// tags: smoke, load, soak, cart, S
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CartPage from '../../pages/yves/cart.page';
import exec from 'k6/execution';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/yves/login.page';
import ProductPage from '../../pages/yves/product.page';
import { parseHTML } from 'k6/html';
import { CustomerFixture } from '../../fixtures/customer.fixture';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S19',
  group: 'Cart',
  metrics: ['S19_post_cart_add'],
  thresholds: {
    S19_post_cart_add: {
      smoke: ['avg<300'],
      load: ['avg<600'],
      soak: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = CustomerFixture.createFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  itemCount: 1,
  randomItems: true,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const customer = fixture.iterateData(data, exec.vu.idInTest);
  const product = customer.products[0];
  const email = customer.customerEmail;

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
}
