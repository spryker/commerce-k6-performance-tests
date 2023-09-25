import {fail, check} from "k6";
import {browser} from 'k6/experimental/browser';

export class BrowserHelper {
    constructor(urlHelper) {
        this.urlHelper = urlHelper;
    }

    async getLoggedInUserContext() {
        const loginPage = browser.newPage();
        await loginPage.goto(`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);

        await Promise.all([
            loginPage.locator('#loginForm_email').type('sonia@spryker.com'),
            loginPage.locator('#loginForm_password').type('change123')
        ]);

        await Promise.all([
            loginPage.locator('form[name=loginForm] button[type=submit]').click(),
            loginPage.waitForNavigation(),
        ]);

        if (!check(loginPage, {
            'Verify Customer is logged in': (page) => page.locator('.user-navigation__user-name .user-navigation__text').textContent().trim() === 'Sonia Wagner'
        })) {
            fail();
        }

        loginPage.close();

        return loginPage.context();
    }
}
