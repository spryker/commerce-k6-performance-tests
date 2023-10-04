import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedProductSearchBySkuScenario extends AbstractScenario {
    execute() {
        let self = this;

        group('ProductSearch', function () {
            const searchPageResponse = self.http.sendGetRequest(self.getStorefrontBaseUrl() + '/search?q=657712');

            self.assertResponseStatus(searchPageResponse, 200);
            self.assertResponseBodyIncludes(searchPageResponse, 'FRIWA stackable chair');
        });
    }
}
