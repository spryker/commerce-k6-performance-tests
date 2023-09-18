export default class CustomerHelper {
    getDefaultCustomerEmail() {
        return __ENV.DEFAULT_CUSTOMER_EMAIL ? __ENV.DEFAULT_CUSTOMER_EMAIL : 'sonia@spryker.com';
    }
}
