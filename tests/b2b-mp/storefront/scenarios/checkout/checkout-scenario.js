import { SharedCheckoutScenario } from '../../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';

export class CheckoutScenario extends SharedCheckoutScenario {
    _getPaymentFormFields() {
        return {
            'paymentForm[paymentSelection]': 'dummyMarketplacePaymentInvoice',
            'paymentForm[dummyMarketplacePaymentInvoice][dateOfBirth]': '12.12.2000'
        };
    }
}
