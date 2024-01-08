import {fail, check} from "k6";
import {browser} from 'k6/experimental/browser';

export class BrowserHelper {
    constructor(urlHelper, customerHelper) {
        this.urlHelper = urlHelper;
        this.customerHelper = customerHelper;
    }

    //TODO
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

        if (!check(loginPage, {
            'Verify Customer is logged in': (page) => page.locator('.user-navigation__user-name .user-navigation__text').textContent().trim() === 'Sonia Wagner'
        })) {
            fail('Customer is logged in assertion failed: element with selector ".user-navigation__user-name .user-navigation__text" does not exist or does not contain "Sonia Wagner" text');
        }

        loginPage.close();

        return loginPage.context();
    }
}
