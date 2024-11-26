import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';

export class CheckoutScenario extends SharedCheckoutScenario {
    _getPaymentProviderName(isMpPaymentProvider = true) {
        return isMpPaymentProvider ? 'DummyPayment' : 'DummyPayment';
    }
}
