import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartsScenario extends AbstractScenario {
    execute() {
        let self = this;
        this.cartHelper.haveCartWithProducts(1);

        group('Cart', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();
            requestParams.tags = { request_name: 'sapi_get_carts' };

            const cartsResponse = self.http.sendGetRequest(self.http.url`${self.getStorefrontApiBaseUrl()}/carts`, requestParams, false);
            self.assertionsHelper.assertResponseStatus(cartsResponse, 200);
        });
    }
}
