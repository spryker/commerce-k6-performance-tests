export default class PaymentUtil {
  static getPaymentMethodName() {
    return 'Invoice';
  }

  static getPaymentProviderName() {
    switch (__ENV.ENV_REPOSITORY_ID) {
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
