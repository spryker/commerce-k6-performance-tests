import { AbstractB2bMpScenario } from '../../../abstract-b2b-mp-scenario.js';
import { group } from 'k6';

export class ProductSearchScenario extends AbstractB2bMpScenario {
    execute() {
        let self = this;

        group('Product Search', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const productSearchResponse = self.http.sendGetRequest(
                self.getStorefrontApiBaseUrl() + `/catalog-search?q=657712`, requestParams, false
            );
            self.assertResponseStatus(productSearchResponse, 200);
        });
    }
}
