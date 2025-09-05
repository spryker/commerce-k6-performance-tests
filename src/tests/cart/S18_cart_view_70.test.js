// tags: smoke, load, cart, S
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import CartPage from '../../pages/yves/cart.page';
import { LoginPage } from '../../pages/yves/login.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S18',
  group: 'Cart',
  metrics: ['S18_get_cart'],
  thresholds: {
    S18_get_cart: {
      smoke: ['avg<300'],
      load: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  cartCount: 1,
  itemCount: 70,
  defaultItemPrice: 1000,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail } = fixture.iterateData(data);

  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage(customerEmail);
    headers = loginPage.login();
  });

  group(testConfiguration.group, () => {
    const cartPage = new CartPage(headers);
    const response = cartPage.get();

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
