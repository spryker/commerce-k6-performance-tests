export class StorefrontHelper {
    constructor(urlHelper, http, customerHelper, responseValidatorHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
        this.responseValidatorHelper = responseValidatorHelper;
    }

    loginUser() {
        const loginResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);
        this.responseValidatorHelper.validateResponseContainsText(loginResponse, 'Access your account', 'Login');

        this.http.submitForm(loginResponse, {
            formSelector: 'form[name="loginForm"]',
            fields: { 'loginForm[email]': this.customerHelper.getDefaultCustomerEmail(), 'loginForm[password]': this.customerHelper.getDefaultCustomerPassword() }
        });

        const overviewResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/customer/overview`);
        this.responseValidatorHelper.validateResponseContainsText(overviewResponse, 'Overview', 'Overview');
    }
}
