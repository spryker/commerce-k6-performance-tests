import { sleep } from 'k6';
import { browser } from 'k6/browser';

class ContextStorage {
    #context;
    #page;

    constructor(context, page) {
        this.#context = context;
        this.#page = page;
    }

    setContext(context) {
        this.#context = context;
    }

    getContext() {
        return this.#context;
    }

    setPage(page) {
        this.#page = page;
    }

    getPage() {
        return this.#page;
    }
}

export class AdminHelper {
    constructor(urlHelper, http, assertionsHelper, browserHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.assertionsHelper = assertionsHelper;
        this.browserHelper = browserHelper;

        this.session = null;
        this.contextStorage = new ContextStorage(null, null);

        let baseUri = this.urlHelper.getBackofficeBaseUrl();

        this.firstSalesOrderViewButtonSelector = '.dataTable tbody tr:nth-child(1) .btn-view';
        this.omsFormSubmitSelector = 'button#oms_trigger_form_submit';

        this.loginUrl = baseUri + '/security-gui/login';
        this.loginCheckUrl = baseUri + '/login_check';
        this.salesUrl = baseUri + '/sales';
        this.salesTableUrl = baseUri + '/sales/index/table';
        this.salesDetailUrl = baseUri + '/sales/detail';
        this.omsTriggerUrl = baseUri + '/oms/trigger/submit-trigger-event-for-order';

        this.backofficeSessionKey = 'backoffice-eu-spryker-local';

        this.formSelector = 'form[name="auth"]';
    }

    getDefaultAdminEmail() {
        return __ENV.DEFAULT_ADMIN_EMAIL ? __ENV.DEFAULT_ADMIN_EMAIL : 'admin@spryker.com';
    }

    getDefaultAdminPassword() {
        return __ENV.DEFAULT_ADMIN_PASSWORD ? __ENV.DEFAULT_ADMIN_PASSWORD : 'change123';
    }

    async loginBackoffice() {
        const context = await browser.newContext();
        this.contextStorage.setContext(context);
        const page = await context.newPage();
        this.contextStorage.setPage(page);

        await page.goto(this.loginUrl);
        await page.waitForSelector(this.formSelector, {timeout: 5000});

        await page.fill(`${this.formSelector} input[name="auth[username]"]`, this.getDefaultAdminEmail());
        await page.fill(`${this.formSelector} input[name="auth[password]"]`, this.getDefaultAdminPassword());
        await page.click(`${this.formSelector} button[type="submit"]`);
        await page.waitForLoadState('networkidle', {timeout: 5000});
    }

    async goToSalesPage() {
        const page = this.contextStorage.getPage();

        page.on('metric', (metric) => {
            metric.tag({
                name: this.salesTableUrl,
                matches: [
                    {url: new RegExp(this.salesTableUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), method: 'GET'},
                ],
            });
        });

        await page.goto(this.salesUrl, { timeout: 5000 });
        await page.waitForLoadState('networkidle', { timeout: 2000 });
    }

    async openFirstSalesOrder() {
        let self = this;

        const page = this.contextStorage.getPage();

        page.on('metric', (metric) => {
            metric.tag({
                name: self.salesDetailUrl,
                matches: [
                    {url: new RegExp(self.salesDetailUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), method: 'GET'},
                ],
            });
        });

        await page.waitForSelector(this.firstSalesOrderViewButtonSelector, {state: 'visible'});
        await page.click(this.firstSalesOrderViewButtonSelector);
        await page.waitForLoadState('networkidle', { timeout: 2000 });
    }

    async waitForOrderHasOmsTriggerButton() {
        const page = this.contextStorage.getPage();

        await page.waitForSelector(this.omsFormSubmitSelector, {state: 'visible'});

        await this.recursiveWaitForSelectorWithText(this.omsFormSubmitSelector, 'Pay', 60 );
    }

    async payForTheOrder() {
        const page = this.contextStorage.getPage();

        await page.waitForLoadState('networkidle', { timeout: 5000 });

        page.on('metric', (metric) => {
            metric.tag({
                name: this.omsTriggerUrl,
                matches: [
                    {url: new RegExp(this.omsTriggerUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), method: 'POST'},
                ],
            });
        });

        // const submitButtons = await page.$$(this.omsFormSubmitSelector);
        // const submitButton = await this.findButtonByText(submitButtons, 'Pay');

        const payButton = await page.locator('#order-overview > .row .ibox-content > .row > .col-md-12 .ibox-content form:nth-child(2) button');
        console.log('visible', await payButton.isVisible());
        console.log('enabled', await payButton.isEnabled());
        await payButton.click({
            force: true,
            noWaitAfter: true,
        });
        await page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    async recursiveWaitForSelectorWithText(selector, text, maxRetries = 10) {
        const page = this.contextStorage.getPage();
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const submitButtons = await page.$$(selector);
            for (let i = 0; i < submitButtons.length; i++) {
                if ((await submitButtons[i].innerText()) === text) {
                    return;
                }
            }

            sleep(1);
            await page.reload();
        }
    }

    async findButtonByText(buttons, text) {
        for (let i = 0; i < buttons.length; i++) {
            if ((await buttons[i].innerText()) === text) {
                return buttons[i];
            }
        }

        return null;
    }

    async takeScreenshot(fileName = new Date().toString() + 'screenshot.png') {
        const page = this.contextStorage.getPage();
        await page.screenshot({ path: 'results/' + fileName });
        console.log(`Screenshot saved to ${fileName}`);
    }
}
