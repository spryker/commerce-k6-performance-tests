import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedHomepageScenario extends AbstractScenario {
  execute() {
    let self = this;

    group('Homepage', function () {
      const homePageResponse = self.http.sendGetRequest(self.http.url`${self.getStorefrontBaseUrl()}`);
      self.assertionsHelper.assertResponseStatus(homePageResponse, 200);
    });
  }
}
