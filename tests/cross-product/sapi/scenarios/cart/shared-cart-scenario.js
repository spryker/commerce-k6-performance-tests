import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartScenario extends AbstractScenario {
  execute() {
    const requestParams = this.cartHelper.getParamsWithAuthorization();
    const cartId = this._setUp(requestParams);
    let self = this;

    group('Cart', function () {
      const cartResponse = self.http.sendGetRequest(
        self.http.url`${self.cartHelper.getCartsUrl()}/${cartId}/?include=items`,
        requestParams,
        false
      );

      self.assertionsHelper.assertResponseStatus(cartResponse, 200);
    });
  }

  _setUp() {
    return this.cartHelper.haveCartWithProducts(__ENV.numberOfItems);
  }
}
