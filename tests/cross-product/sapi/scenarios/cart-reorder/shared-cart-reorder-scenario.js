import { AbstractScenario } from '../../../../abstract-scenario.js';

export class SharedCartReorderScenario extends AbstractScenario {
  execute(customerEmail, orderId, thresholdTag = null) {
    const requestParams = this.cartHelper.getParamsWithAuthorization(customerEmail);
    if (thresholdTag) {
      requestParams.tags = { name: thresholdTag };
    }

    return this.http.sendPostRequest(
      this.http.url`${this.getStorefrontApiBaseUrl()}/cart-reorder`,
      JSON.stringify(this._getCartReorderAttributes(orderId)),
      requestParams,
      false
    );

    // this.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);
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

    // this.assertionsHelper.assertResponseStatus(cartReorderResponse, 201);

    return JSON.parse(cartReorderResponse.body);
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
