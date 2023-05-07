import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Cart', function () {
            const cartId = self.cartHelper.haveCartWithProducts(__ENV.numberOfItems);
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const cartResponse = self.http.sendGetRequest(
                `${self.cartHelper.getCartsUrl()}/${cartId}/?include=items`, requestParams, false
            );

            self.assertResponseStatus(cartResponse);
        });
    }
}
