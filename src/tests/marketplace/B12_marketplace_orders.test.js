import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/bo/login.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import MerchantSalesPage from '../../pages/bo/merchant-sales.page';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'B12',
  group: 'Marketplace',
  metrics: ['B12_get_merchant_sales'],
  vus: 1,
  iterations: 10,
  thresholds: {
    B12_get_merchant_sales: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
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
    defaultItemPrice: 5000,
    forceMarketplace: true,
  });

  const data = dynamicFixture.getData();
  dynamicFixture.preparePaidOrders(data);
}

export default function () {
  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage('richard@spryker.com');
    headers = loginPage.login();
  });

  const merchantSalesPage = new MerchantSalesPage(headers);

  group('Marketplace orders', () => {
    const merchantSalesResponse = merchantSalesPage.all();

    metrics[testConfiguration.metrics[0]].add(merchantSalesResponse.timings.duration);
  });
}
