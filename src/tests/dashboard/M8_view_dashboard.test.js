import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { MerchantUserFixture } from '../../fixtures/merchant-user.fixture';
import { browser } from 'k6/browser';
import { DashboardPage } from '../../pages/mp/dashboard.page';
import { LoginPage } from '../../pages/mp/login.page';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'M8',
  group: 'Dashboard',
  metrics: ['M8_view_dashboard'],
  thresholds: {
    M8_view_dashboard: {
      smoke: ['avg<475'],
      load: ['avg<475'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new MerchantUserFixture({
    idMerchant: 1,
    merchantUserCount: testConfiguration.vus,
  });

  return dynamicFixture.getData();
}

export function teardown() {
  MerchantUserFixture.runConsoleCommands(['console queue:worker:start --stop-when-empty']);
}

export default async function (data) {
  const merchantUser = MerchantUserFixture.iterateData(data);
  let browserContext = await browser.newContext();

  try {
    browserContext = await login(browserContext, merchantUser);
    const durationTime = await openDashboardPage(browserContext);

    metrics[testConfiguration.metrics[0]].add(durationTime);
  } finally {
    await browserContext.close();
  }
}

async function login(browserContext, merchantUser) {
  const page = await browserContext.newPage({ headless: false });
  const loginPage = new LoginPage(page);

  try {
    await loginPage.navigate();
    await loginPage.login(merchantUser.username, merchantUser.password);

    return browserContext;
  } finally {
    await page.close();
  }
}

async function openDashboardPage(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const dashboardPage = new DashboardPage(page);

  try {
    await dashboardPage.navigate();
    await dashboardPage.verifyHeader();

    return await dashboardPage.getDurationTime();
  } finally {
    await page.close();
  }
}
