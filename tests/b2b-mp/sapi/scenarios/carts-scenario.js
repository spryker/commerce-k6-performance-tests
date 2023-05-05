import { AbstractB2bMpScenario } from '../../abstract-b2b-mp-scenario.js';
import { group } from 'k6';

export class CartsScenario extends AbstractB2bMpScenario {
    execute() {
        let self = this;

        group('Cart', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const cartsResponse = self.http.sendGetRequest(
                self.getStorefrontApiBaseUrl() + `/carts`, requestParams, false
            );
            self.assertResponseStatus(cartsResponse, 200);
        });
    }
}
