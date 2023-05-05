import { AbstractB2bMpScenario } from '../../abstract-b2b-mp-scenario.js';
import { group } from 'k6';

export class HomepageScenario extends AbstractB2bMpScenario {
    execute() {
        let self = this;

        group('Homepage', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const homepageResponse = self.http.sendGetRequest(
                self.getStorefrontApiBaseUrl() + `/cms-pages/10014bd9-4bba-5a54-b84f-31b4b7efd064`, requestParams, false
            );
            self.assertResponseStatus(homepageResponse, 200);
        });
    }
}
