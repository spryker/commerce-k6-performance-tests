export class AdminHelper {
    constructor(urlHelper, http, assertionsHelper, browserHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.assertionsHelper = assertionsHelper;
        this.browserHelper = browserHelper;

        this.session = null;
        this.page = null;

        let baseUri = this.urlHelper.getBackofficeBaseUrl();

        this.firstSalesOrderViewButtonSelector = '.dataTable tbody tr:nth-child(1) .btn-view';

        this.loginUrl = baseUri + '/security-gui/login';
        this.loginCheckUrl = baseUri + '/login_check';
        this.salesUrl = baseUri + '/sales';
        this.salesTableUrl = baseUri + '/sales/index/table';
        this.dashboardUrl = baseUri + '/dashboard';

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
        let loginContext = await this.browserHelper.createNewContext();
        let loginPage = await loginContext.newPage();

        await loginPage.goto(this.loginUrl);
        await loginPage.waitForSelector(this.formSelector, {timeout: 5000});

        const tokenInput = loginPage.locator(`${this.formSelector} input[name="auth[_token]`);
        const token = tokenInput.getAttribute('value');

        let response = this.http.sendPostRequest(this.loginCheckUrl, {
            'auth[username]': this.getDefaultAdminEmail(),
            'auth[password]': this.getDefaultAdminPassword(),
            'auth[_token]': token
        });

        this.session = response.cookies[this.backofficeSessionKey][0];

        await loginPage.close();
        await loginContext.close();

        let backofficeContext = await this.browserHelper.createNewContext();
        await backofficeContext.addCookies([
            this.session,
        ]);

        this.page = await backofficeContext.newPage();
    }

    async goToSalesPage() {
        this.page.on('metric', (metric) => {
            metric.tag({
                name: this.urlHelper.getBackofficeBaseUrl() + '/sales/index/table',
                matches: [
                    {url: /^http:\/\/backoffice\.eu\.spryker\.local\/sales\/index\/table.*/, method: 'GET'},
                ],
            });
        });

        await this.page.goto(this.salesUrl, { timeout: 5000 });
        await this.page.waitForLoadState('networkidle', { timeout: 2000 });
    }
}
