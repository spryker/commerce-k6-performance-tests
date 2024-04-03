export class StorefrontHelper {
  constructor(urlHelper, http, customerHelper, assertionsHelper) {
    this.urlHelper = urlHelper;
    this.http = http;
    this.customerHelper = customerHelper;
    this.assertionsHelper = assertionsHelper;
  }

  loginUser() {
    const loginResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/login`);
    this.assertionsHelper.assertResponseContainsText(loginResponse, 'Access your account');

    this.http.submitForm(loginResponse, {
      formSelector: 'form[name="loginForm"]',
      fields: { 'loginForm[email]': this.customerHelper.getDefaultCustomerEmail(), 'loginForm[password]': this.customerHelper.getDefaultCustomerPassword() }
    });

    const overviewResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/customer/overview`);
    this.assertionsHelper.assertResponseContainsText(overviewResponse, 'Overview');
  }
}
