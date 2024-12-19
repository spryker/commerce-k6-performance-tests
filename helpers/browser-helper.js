import { browser } from 'k6/browser';

export class BrowserHelper {
    constructor(urlHelper, customerHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.customerHelper = customerHelper;
        this.assertionsHelper = assertionsHelper;

        this.url = '';
        this.context = null;
        this.page = null;
    }

    async getLoggedInUserContext() {
        const loginPage = browser.newPage();
        await loginPage.goto(`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);

        await Promise.all([
            loginPage.locator('#loginForm_email').type(this.customerHelper.getDefaultCustomerEmail()),
            loginPage.locator('#loginForm_password').type(this.customerHelper.getDefaultCustomerPassword())
        ]);

        await Promise.all([
            loginPage.locator('form[name=loginForm] button[type=submit]').click(),
            loginPage.waitForNavigation(),
        ]);

        this.assertionsHelper.assertPageState(
            loginPage,
            'Verify Customer is logged in',
            (page) => page.url() === `${this.urlHelper.getStorefrontBaseUrl()}/en/customer/overview`,
        );

        loginPage.close();

        return loginPage.context();
    }

    async createNewContext() {
        return browser.newContext();
    }

    async takeScreenshot(page, fileName = new Date().toString() + 'screenshot.png') {
        await page.screenshot({ path: 'results/' + fileName });
        console.log(`Screenshot saved to ${fileName}`);
    }

    async cleanup() {
        await this.page.close();
        await this.context.close();
        console.log('Browser context closed.');
    }
}
