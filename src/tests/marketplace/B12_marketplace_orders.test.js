import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/bo/login.page';
import SalesPage from '../../pages/bo/sales.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import { parseHTML } from 'k6/html';
import KSixError from '../../utils/k-six-error';
import MerchantSalesPage from '../../pages/bo/merchant-sales.page';
import AbstractResource from '../../resources/abstract.resource';

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

  const loginPage = new LoginPage();
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
  if (EnvironmentUtil.getRepositoryId() === 'b2b') {
    throw new KSixError('This test is not supported for B2B');
  }

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
