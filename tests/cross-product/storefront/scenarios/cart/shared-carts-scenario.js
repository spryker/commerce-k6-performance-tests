import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartsScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Cart', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const cartsResponse = self.http.sendGetRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/carts`, requestParams, false
            );
            self.assertResponseStatus(cartsResponse, 200);
        });
    }
}
