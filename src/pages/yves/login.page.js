import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

const DEFAULT_PASSWORD = 'change123';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#loginForm_email');
    this.passwordInput = page.locator('#loginForm_password');
    this.submitButton = page.locator('[name="loginForm"] button[type="submit"]');
    this.header = page.locator('h1');
  }

  async navigate() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/login`);
  }

  async login(username, password = null) {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password || DEFAULT_PASSWORD);
    await Promise.all([this.page.waitForNavigation(), this.submitButton.click()]);
    await this.header.waitFor();
    const headerText = await this.header.textContent();
    addErrorToCounter(
      check(headerText, {
        'Login was successful': (text) => text === 'Overview',
      })
    );
  }
}
