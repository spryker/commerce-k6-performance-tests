import {browser} from 'k6/experimental/browser';

export class BrowserHelper {
    constructor(urlHelper, customerHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.customerHelper = customerHelper;
        this.assertionsHelper = assertionsHelper;
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
            (page) => page.url() === `${this.urlHelper.getStorefrontBaseUrl()}/DE/en/customer/overview`,
        );

        loginPage.close();

        return loginPage.context();
    }
}
