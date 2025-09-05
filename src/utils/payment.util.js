export default class PaymentUtil {
  static getPaymentMethodName() {
    return 'Invoice';
  }

  static getPaymentProviderName(forceMarketplace = false) {
    if (forceMarketplace) {
      return 'DummyMarketplacePayment';
    }

    switch (__ENV.SPRYKER_REPOSITORY_ID) {
      case 'suite':
        return 'DummyPayment';
      case 'b2b':
        return 'DummyPayment';
      case 'b2b-mp':
        return 'DummyMarketplacePayment';
      default:
        console.error('Name or env not defined');
    }
  }
}
