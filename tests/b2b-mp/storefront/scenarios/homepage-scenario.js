import { AbstractB2bMpScenario } from '../../abstract-b2b-mp-scenario.js';
import { group } from 'k6';

export class HomepageScenario extends AbstractB2bMpScenario {
    execute() {
        let self = this;

        group('Homepage', function () {
            const homePageResponse = self.http.sendGetRequest(self.getStorefrontBaseUrl());
            self.assertResponseBodyIncludes(homePageResponse, 'Your Experience is Our Priority');
        });
    }
}
