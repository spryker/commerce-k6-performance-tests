import { SharedQuickOrderScenario } from '../../../../cross-product/storefront/scenarios/quick-order/shared-quick-order-scenario.js';

export class QuickOrderScenario extends SharedQuickOrderScenario {
    _getQuantityInputSelector() {
        return 'quick-order-row:nth-child(2) .quick-order-row-partial__quantity';
    }
}
