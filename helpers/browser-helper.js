import { browser } from 'k6/experimental/browser';

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

    async setupBrowser() {
        this.context = browser.newContext();
        // console.log('Browser context created.', this.context);
        this.page = this.context.newPage();
    }

    getPage() {
        return this.page;
    }

    // async navigate(path) {
    //     await this.page.goto(path);
    //     console.log(`Navigated to ${path}`);
    // }

    async takeScreenshot(fileName = 'screenshot.png') {
        await this.page.screenshot({ path: fileName });
        console.log(`Screenshot saved to ${fileName}`);
    }

    async cleanup() {
        await this.page.close();
        await this.context.close();
        console.log('Browser context closed.');
    }
}
