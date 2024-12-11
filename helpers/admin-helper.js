import { browser } from 'k6/experimental/browser';

export class AdminHelper {
    constructor(urlHelper, http, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.assertionsHelper = assertionsHelper;

        this.page = null;

        let baseUri = this.urlHelper.getBackofficeBaseUrl();

        this.firstSalesOrderViewButtonSelector = '.dataTable tbody tr:nth-child(1) .btn-view';

        this.loginUrl = baseUri + '/security-gui/login';
        this.salesUrl = baseUri + '/sales';
        this.salesTableUrl = baseUri + '/sales/index/table';

        this.formSelector = 'form[name="auth"]';
    }

    getDefaultAdminEmail() {
        return __ENV.DEFAULT_ADMIN_EMAIL ? __ENV.DEFAULT_ADMIN_EMAIL : 'admin@spryker.com';
    }

    getDefaultAdminPassword() {
        return __ENV.DEFAULT_ADMIN_PASSWORD ? __ENV.DEFAULT_ADMIN_PASSWORD : 'change123';
    }

    async setBrowserPage(page) {
        this.page = page;
    }

    async loginBackoffice() {
        try {
            await this.page.goto(this.loginUrl);
            await this.page.waitForSelector(this.formSelector, {timeout: 5000});

            await Promise.all([
                this.page.locator('input[name="auth[username]"').type(this.getDefaultAdminEmail()),
                this.page.locator('input[name="auth[password]"').type(this.getDefaultAdminPassword()),
            ]);

            await Promise.all([
                this.page.waitForSelector('.sidebar-collapse', {timeout: 5000}),
                this.page.locator('form[name=auth] button[type=submit]').click(),
            ]);

            // await this.page.locator('form[name=auth] button[type=submit]').click();

            // await this.page.goto('http://backoffice.eu.spryker.local/sales');
            // await newPage.waitForLoadState('domcontentloaded');
            // await this.page.screenshot({path: 'salesPage.png'});
            // // await this.page.waitForLoadState('domcontentloaded');
            // console.log(newPage.url());

            // await this.page.goto('http://backoffice.eu.spryker.local/sales');
            // await this.page.waitForLoadState('domcontentloaded');
            //
            // await this.page.screenshot({path: 'salesPage.png'});
            // await Promise.all([
            //
            //     ,
            // ]);

            // await loginPage.waitForSelector('.sidebar-collapse', {timeout: 10000});
            // await this.page.goto(this.loginUrl);
            //
            // await this.page.waitForSelector(this.formSelector);
            //
            // await Promise.all([
            //     this.page.locator(this.formSelector + ' ' + 'input[name="auth[username]"]').type(this.getDefaultAdminEmail()),
            //     this.page.locator(this.formSelector + ' ' + 'input[name="auth[password]"]').type(this.getDefaultAdminPassword())
            // ]);
            //
            // await this.page.screenshot({path: 'login_before.png'});
            // console.log('Form filled.');
            // console.log(this.page.url());
            // const submitButton = this.page.locator(this.formSelector + ' ' + 'button[type="submit"]');
            //
            // await Promise.all([
            //     this.page.locator(submitButton).click(),
            //     this.page.waitForNavigation(),
            // ]);
            //
            // await this.page.waitForNavigation({ timeout: 5000 });
            // await this.page.waitForSelector('.sidebar-collapse', { timeout: 5000 });
            // console.log('Form submitted.');
            // await this.page.screenshot({path: 'login_after.png'});
            //
            // const currentUrl = this.page.url();
            // console.log('Current URL after form submission:', currentUrl);
            // //
            //
            // await this.page.screenshot({path: 'login_after.png'});
        } catch (error) {
            console.error('Error:', error);
        }
        // const loginResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getBackofficeBaseUrl()}/security-gui/login`);
        // if (loginResponse.status !== 200) {
        //     return;
        // }
        //
        // this.assertionsHelper.assertResponseContainsText(loginResponse, 'Login');
        //
        // this.http.submitForm(loginResponse, {
        //     formSelector: 'form[name="auth"]',
        //     fields: { 'auth[username]': this.getDefaultAdminEmail(), 'auth[password]': this.getDefaultAdminPassword() }
        // });
        //
        // const dashboardResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getBackofficeBaseUrl()}/dashboard`);
        // this.assertionsHelper.assertResponseContainsText(dashboardResponse, 'Dashboard');
    }

    async fillAndSubmitForm(selector, data) {

        console.log('Form submitted.');
    }

    async goToSalesPage() {
        await this.page.goto(this.salesUrl, { timeout: 5000 });
        // await page.waitForSelector('.dataTable');
        // await this.page.evaluate(() => {
        //     fetch(this.salesTableUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        //         .then(response => response.json())
        //         .then(data => console.log(data));
        // }, { tags: { name: 'salesTable' } });
    }

    // openFirstSalesOrder() {
    //     this.page.waitForSelector(this.firstSalesOrderViewButtonSelector);
    //     this.page.click(this.firstSalesOrderViewButtonSelector);
    // }
    //
    // getCurrentUrl() {
    //     return this.page.url();
    // }
}
