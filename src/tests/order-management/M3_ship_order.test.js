import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/mp/login.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import exec from 'k6/execution';
import OrdersPage from '../../pages/mp/orders.page';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'M3',
  group: 'Order management',
  metrics: ['M3_get_order_details', 'M3_post_ship_order'],
  vus: 1,
  iterations: 10,
  thresholds: {
    M3_get_order_details: {
      smoke: ['avg<800'],
      load: ['avg<800'],
    },
    M3_post_ship_order: {
      smoke: ['avg<800'],
      load: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new OrderFixture({
    customerCount: testConfiguration.vus,
    ordersCount: testConfiguration.iterations,
    itemCount: 70,
    defaultItemPrice: 1000,
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

  const ordersPage = new OrdersPage(headers);
  const ordersTableData = JSON.parse(ordersPage.tableData().body).data;
  const merchantOrderId = ordersTableData[exec.scenario.iterationInTest].idMerchantOrder;

  group('Order Details', () => {
    const ordersDetailPageDuration = ordersPage.get(merchantOrderId);

    metrics[testConfiguration.metrics[0]].add(ordersDetailPageDuration);
  });

  group('Ship order', () => {
    const omsTriggerEventResponse = ordersPage.triggerEvent(merchantOrderId, 'send to distribution');

    metrics[testConfiguration.metrics[1]].add(omsTriggerEventResponse.timings.duration);
  });
}
