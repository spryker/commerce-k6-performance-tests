// tags: smoke, load
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/bo/login.page';
import SalesPage from '../../pages/bo/sales.page';
import { OrderFixture } from '../../fixtures/order.fixture';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'B1',
  group: 'Order management',
  metrics: ['B1_get_sales'],
  vus: 1,
  iterations: 10,
  thresholds: {
    B1_get_sales: {
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
    ordersCount: testConfiguration.iterations,
    itemCount: 1,
    defaultItemPrice: 10000,
  });

  return dynamicFixture.getData();
}

export default function () {
  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage();
    headers = loginPage.login();
  });

  group(testConfiguration.group, () => {
    const salesPage = new SalesPage(headers);
    const salesPageDuration = salesPage.all();

    metrics[testConfiguration.metrics[0]].add(salesPageDuration);
  });
}
