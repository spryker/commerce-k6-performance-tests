// tags: smoke, load
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { MerchantUserFixture } from '../../fixtures/merchant-user.fixture';
import { DashboardPage } from '../../pages/mp/dashboard.page';
import { LoginPage } from '../../pages/mp/login.page';
import exec from 'k6/execution';
import { group } from 'k6';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'M8',
  group: 'Dashboard',
  metrics: ['M8_get_mp_dashboard'],
  thresholds: {
    M8_get_mp_dashboard: {
      smoke: ['avg<475'],
      load: ['avg<475'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new MerchantUserFixture({
  idMerchant: 1,
  merchantUserCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
});

export function setup() {
  return fixture.getData();
}

export function teardown() {
  MerchantUserFixture.runConsoleCommands(['console queue:worker:start --stop-when-empty']);
}

export default async function (data) {
  const merchantUser = fixture.iterateData(data);

  let headers = {};
  group('Login', () => {
    const loginPage = new LoginPage(merchantUser.username);
    headers = loginPage.login();
  });

  group('Open dashboard page', () => {
    const dashboardPage = new DashboardPage(headers);
    const dashboardPageResponse = dashboardPage.get();

    metrics[testConfiguration.metrics[0]].add(dashboardPageResponse.timings.duration);
  });
}
