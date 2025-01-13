import { sleep } from 'k6';
import { browser } from 'k6/browser';

const formSelector = 'form[name="auth"]';
const usernameInputSelector = `${formSelector} input[name="auth[username]"]`;
const passwordInputSelector = `${formSelector} input[name="auth[password]"]`;
const authSubmitSelector = `${formSelector} button[type="submit"]`;

const firstSalesOrderViewButtonSelector = '.dataTable tbody tr:nth-child(1) .btn-view';
const omsFormSubmitSelector = 'button#oms_trigger_form_submit';

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

        this.backofficeSessionKey = 'backoffice-eu-spryker-local';

        const backofficeBaseUrl = this.urlHelper.getBackofficeBaseUrl();

        const loginUrl = backofficeBaseUrl + '/security-gui/login';
        const loginCheckUrl = backofficeBaseUrl + '/login_check';
        const salesUrl = backofficeBaseUrl + '/sales';
        const salesTableUrl = backofficeBaseUrl + '/sales/index/table';
        const salesDetailUrl = backofficeBaseUrl + '/sales/detail';
        const omsTriggerUrl = backofficeBaseUrl + '/oms/trigger/submit-trigger-event-for-order';

        this.loginUrl = loginUrl;
        this.loginCheckUrl = loginCheckUrl;
        this.salesUrl = salesUrl;
        this.salesTableUrl = salesTableUrl;
        this.salesDetailUrl = salesDetailUrl;
        this.omsTriggerUrl = omsTriggerUrl;
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
        await page.waitForSelector(formSelector, {timeout: 5000});

        await page.locator(usernameInputSelector).type(this.getDefaultAdminEmail());
        await page.locator(passwordInputSelector).type(this.getDefaultAdminPassword());
        await page.locator(authSubmitSelector).click();

        await page.waitForLoadState('networkidle', {timeout: 5000});
    }

    async goToSalesPage() {
        const page = this.contextStorage.getPage();

        page.on('metric', (metric) => {
            metric.tag({
                name: this.salesTableUrl,
                matches: [
                    {
                        url: new RegExp(this.salesTableUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        method: 'GET',
                    },
                ],
            });
        });

        await page.goto(this.salesUrl, { timeout: 5000 });
        await page.waitForLoadState('networkidle', { timeout: 2000 });
    }

    async openFirstSalesOrder() {
        let self = this;

        const page = this.contextStorage.getPage();
        const buttonLocator = await page.locator(firstSalesOrderViewButtonSelector);

        page.on('metric', (metric) => {
            metric.tag({
                name: self.salesDetailUrl,
                matches: [
                    {
                        url: new RegExp(self.salesDetailUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        method: 'GET',
                    },
                ],
            });
        });

        await buttonLocator.waitFor({state: 'visible'});
        await buttonLocator.click(firstSalesOrderViewButtonSelector);

        await page.waitForLoadState('networkidle', { timeout: 2000 });
    }

    async waitForOrderHasOmsTriggerButton() {
        const page = this.contextStorage.getPage();

        await page.locator(omsFormSubmitSelector).waitFor({state: 'visible'});

        await this.recursiveWaitForSelectorWithText(omsFormSubmitSelector, 'Pay', 60 );
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

        // const submitButtons = await page.$$(omsFormSubmitSelector);
        // const submitButton = await this.findButtonByText(submitButtons, 'Pay');

        const payButton = await page.locator('#order-overview > .row .ibox-content > .row > .col-md-12 .ibox-content form:nth-child(2) button');

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
