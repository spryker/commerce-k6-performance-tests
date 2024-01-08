import { fail, check } from "k6";

export class StorefrontHelper {
    constructor(urlHelper, http, customerHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
    }

    loginUser() {
        const loginResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);

        //TODO - done
        if (
            !check(loginResponse, {
                'Verify Login page text': (r) => r.body.includes('Access your account'),
            })
        ) {
            fail('Login response does not contain "Access your account" text');
        }

        this.http.submitForm(loginResponse, {
            formSelector: 'form[name="loginForm"]',
            fields: { 'loginForm[email]': this.customerHelper.getDefaultCustomerEmail(), 'loginForm[password]': this.customerHelper.getDefaultCustomerPassword() }
        });

        const overviewResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/customer/overview`);

        //TODO - done
        if (
            !check(overviewResponse, {
                'Verify Overview page': (r) => r.body.includes('Overview'),
            })
        ) {
            fail('Overview response does not contain "Overview" text');
        }
    }
}
