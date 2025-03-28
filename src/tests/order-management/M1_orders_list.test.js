import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/mp/login.page';
import { LoginPage as BOLoginPage } from '../../pages/bo/login.page';
import OrdersPage from '../../pages/mp/orders.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import { parseHTML } from 'k6/html';
import SalesPage from '../../pages/bo/sales.page';
import AbstractResource from '../../resources/abstract.resource';
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
    ordersCount: 1,
    itemCount: 1,
    defaultItemPrice: 5000,
    forceMarketplace: true,
  });

  const data = dynamicFixture.getData();

  const loginPage = new BOLoginPage();
  const headers = loginPage.login();
  const salesPage = new SalesPage(headers);
  const abstractResource = new AbstractResource();

  for (let i in data) {
    const { orderIds } = data[i];
    for (let j in orderIds) {
      let orderId = orderIds[j];

      const salesDetailPageResponse = salesPage.get(orderId);
      let omsTriggerFormToken = parseHTML(salesDetailPageResponse.body).find('#oms_trigger_form__token').attr('value');

      salesPage.triggerEvent(orderId, 'pay', omsTriggerFormToken);
    }
  }

  abstractResource.runConsoleCommands(['oms:check-condition']);
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
