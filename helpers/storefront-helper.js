import { fail, check } from "k6";

export class StorefrontHelper {
    constructor(urlHelper, http) {
        this.urlHelper = urlHelper;
        this.http = http;
    }

    loginUser() {
        const loginResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);

        if (
            !check(loginResponse, {
                'Verify Login page text': (r) => r.body.includes('Access your account'),
            })
        ) {
            fail();
        }

        this.http.submitForm(loginResponse, {
            formSelector: 'form[name="loginForm"]',
            fields: { 'loginForm[email]': 'sonia@spryker.com', 'loginForm[password]': 'change123' }
        });

        const overviewResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/customer/overview`);

        if (
            !check(overviewResponse, {
                'Verify Overview page': (r) => r.body.includes('Overview'),
            })
        ) {
            fail();
        }
    }
}
