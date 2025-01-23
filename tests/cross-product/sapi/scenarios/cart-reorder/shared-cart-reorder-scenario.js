import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCartReorderScenario extends AbstractScenario {
  execute(customerEmail, orderId, thresholdTag = null) {
    let self = this;
    group('Cart Reorder', function () {
      self.haveReorder(customerEmail, orderId, thresholdTag);
    });
  }

  haveReorder(customerEmail, orderId, thresholdTag = null) {
    const requestParams = this.cartHelper.getParamsWithAuthorization(customerEmail);
    if (thresholdTag) {
      requestParams.tags = { name: thresholdTag };
    }

    const cartReorderResponse = this.http.sendPostRequest(
      this.http.url`${this.getStorefrontApiBaseUrl()}/cart-reorder`,
      JSON.stringify(this._getCartReorderAttributes(orderId)),
      requestParams,
      false
    );

    this.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);

    try {
      return JSON.parse(cartReorderResponse.body);
    } catch (e) {
      console.log(cartReorderResponse.body);
      throw Error('Failed to parse response during SharedCartReorderScenario::haveReorder()');
    }
  }

  _getCartReorderAttributes(orderId) {
    return {
      data: {
        type: 'cart-reorder',
        attributes: {
          orderReference: orderId,
        },
      },
    };
  }
}
