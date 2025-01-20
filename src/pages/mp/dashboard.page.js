import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';

export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('h1');
  }

  async navigate() {
    await this.page.goto(`${EnvironmentUtil.getMerchantPortalUrl()}/dashboard-merchant-portal-gui/dashboard`);
    await this.page.waitForLoadState('load');
  }

  async verifyHeader() {
    await this.header.waitFor();
    const headerText = await this.header.textContent();

    check(headerText, {
      'Dashboard page was loaded': (text) => text === 'Dashboard',
    });
  }

  async getDurationTime() {
    await this.page.evaluate(() => window.performance.mark('page-visit'));
    const marks = await this.page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('mark')))
    );

    if (marks.length > 0) {
      return marks[0].startTime;
    }

    throw new Error('No marks found');
  }
}
