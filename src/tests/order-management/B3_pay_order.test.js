// tags: smoke, load, order-management, B
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/bo/login.page';
import SalesPage from '../../pages/bo/sales.page';
import { OrderFixture } from '../../fixtures/order.fixture';
import exec from 'k6/execution';
import { parseHTML } from 'k6/html';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not applicable for soak tests.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'B3',
  group: 'Order management',
  metrics: ['B3_get_sales_detail', 'B3_post_pay_order'],
  vus: 1,
  iterations: 10,
  thresholds: {
    B3_get_sales_detail: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    B3_post_pay_order: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new OrderFixture({
  customerCount: testConfiguration.vus,
  ordersCount: testConfiguration.iterations,
  itemCount: 70,
  defaultItemPrice: 1000,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { orderReferences } = fixture.iterateData(data);

  let headers = {};

  group('Login', () => {
    const loginPage = new LoginPage();
    headers = loginPage.login();
  });

  const salesPage = new SalesPage(headers);
  const orderReference = orderReferences[exec.scenario.iterationInTest];
  const orderId = salesPage.retrieveOrderIdByReference(orderReference);

  let omsTriggerFormToken;
  group('Order Details', () => {
    const salesDetailPageResponse = salesPage.get(orderId);

    omsTriggerFormToken = parseHTML(salesDetailPageResponse.body).find('#oms_trigger_form__token').attr('value');

    metrics[testConfiguration.metrics[0]].add(salesDetailPageResponse.timings.duration);
  });

  group('Pay order', () => {
    const omsTriggerEventResponse = salesPage.triggerEvent(orderId, 'pay', omsTriggerFormToken);

    metrics[testConfiguration.metrics[1]].add(omsTriggerEventResponse.timings.duration);
  });
}
