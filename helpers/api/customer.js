export default class Customer {
    //Api
    constructor(api, metrics, targetLocale = 'en', cartSize = 1, useExistingAccount = false) {
        this.metrics = metrics;
        this.targetLocale = targetLocale;
        this.cartSize = cartSize;
        this.useExistingAccount = useExistingAccount;
        this.api = api;
    }

    auth() {

    }

    initCustomer() {

    }

    initBilling() {

    }

    initShipping() {

    }

    initPayment() {

    }

    getCart() {

    }

    clearCart() {

    }

    addProducts(productSkus) {

    }

    placeGuestOrder(payment, products) {

    }

    placeOrder(payment, products) {

    }
}