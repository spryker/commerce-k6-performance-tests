import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#security-merchant-portal-gui_username');
    this.passwordInput = page.locator('#security-merchant-portal-gui_password');
    this.submitButton = page.locator('[name="security-merchant-portal-gui"] button[type="submit"]');
    this.header = page.locator('h1');
  }

  async navigate() {
    await this.page.goto(`${EnvironmentUtil.getMerchantPortalUrl()}/security-merchant-portal-gui/login`);
  }

  async login(username, password) {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);

    await Promise.all([this.page.waitForNavigation(), this.submitButton.click()]);

    await this.header.waitFor();
    const headerText = await this.header.textContent();

    addErrorToCounter(check(headerText, { 'Login was successful': (text) => text === 'Dashboard' }));
  }
}
