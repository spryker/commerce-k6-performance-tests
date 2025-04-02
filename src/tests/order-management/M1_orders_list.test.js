import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/mp/login.page';
import OrdersPage from '../../pages/mp/orders.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'M1',
  group: 'Order management',
  metrics: ['M1_get_orders'],
  vus: 1,
  iterations: 10,
  setupTimeout: '400s',
  thresholds: {
    M1_get_orders: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new OrderFixture({
    customerCount: testConfiguration.vus,
    ordersCount: 25,
    itemCount: 1,
    defaultItemPrice: 5000,
    forceMarketplace: true,
  });

  const data = dynamicFixture.getData();
  dynamicFixture.preparePaidOrders(data);
}

export default function () {
  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage();
    headers = loginPage.login();
  });

  group(testConfiguration.group, () => {
    const ordersPage = new OrdersPage(headers);
    const ordersPageDuration = ordersPage.all();

    metrics[testConfiguration.metrics[0]].add(ordersPageDuration);
  });
}
