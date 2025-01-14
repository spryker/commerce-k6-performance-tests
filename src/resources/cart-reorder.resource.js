import AbstractResource from './abstract.resource';

export default class CartReorderResource extends AbstractResource {
  constructor(orderReference, bearerToken = null) {
    super(bearerToken);
    this.orderReference = orderReference;
  }

  reorder() {
    return this.postRequest('cart-reorder', this._getCartReorderPayload());
  }

  _getCartReorderPayload() {
    return {
      data: {
        type: 'cart-reorder',
        attributes: {
          orderReference: this.orderReference,
        },
      },
    };
  }
}
