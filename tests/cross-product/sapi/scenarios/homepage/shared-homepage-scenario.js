import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedHomepageScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('Homepage', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();

            const homepageResponse = self.http.sendGetRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/cms-pages/${'10014bd9-4bba-5a54-b84f-31b4b7efd064'}`, requestParams, false
            );
            self.assertionsHelper.assertResponseStatus(homepageResponse, 200);
        });
    }
}
