import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Checkout', function () {
            const cartUuid = self.cartHelper.haveCartWithProducts( __ENV.numberOfItems,  __ENV.sku);

            self.assertNotEmpty(cartUuid);
        });
    }
}
