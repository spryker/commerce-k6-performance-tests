import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedProductSearchScenario extends AbstractScenario {
  execute() {
    let self = this;

    group('Product Search', function () {
      const requestParams = self.cartHelper.getParamsWithAuthorization();

      const productSearchResponse = self.http.sendGetRequest(
        self.http.url`${self.getStorefrontApiBaseUrl()}/catalog-search?q=${657712}`,
        requestParams,
        false
      );
      self.assertionsHelper.assertResponseStatus(productSearchResponse, 200);
    });
  }
}
