export default class CustomerHelper {
    getDefaultCustomerEmail() {
        return __ENV.DEFAULT_CUSTOMER_EMAIL ? __ENV.DEFAULT_CUSTOMER_EMAIL : 'sonia@spryker.com';
    }

    getDefaultCustomerPassword() {
        return __ENV.DEFAULT_CUSTOMER_PASSWORD ? __ENV.DEFAULT_CUSTOMER_PASSWORD : 'change123';
    }
}
