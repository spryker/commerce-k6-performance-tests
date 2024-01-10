import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedProductDetailsScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Product Details', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const productDetailsResponse = self.http.sendGetRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/concrete-products/${'657712'}`, requestParams, false
            );
            self.assertionsHelper.assertResponseStatus(productDetailsResponse, 200);
        });
    }
}
