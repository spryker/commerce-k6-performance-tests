import { AbstractB2bMpScenario } from '../../../abstract-b2b-mp-scenario.js';
import { group } from 'k6';

export class ProductDetailsScenario extends AbstractB2bMpScenario {
    execute() {
        let self = this;

        group('Product Details', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const productDetailsResponse = self.http.sendGetRequest(
                self.getStorefrontApiBaseUrl() + `/concrete-products/657712`, requestParams, false
            );
            self.assertResponseStatus(productDetailsResponse, 200);
        });
    }
}
