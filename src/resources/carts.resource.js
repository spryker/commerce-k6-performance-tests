import AbstractResource from './abstract.resource';

export default class CartsResource extends AbstractResource {
  constructor(bearerToken = null) {
    super(bearerToken);
  }

  delete(idCart) {
    return this.deleteRequest(`carts/${idCart}`);
  }

  create(cartName, isDefault = false) {
    return this.postRequest('carts', this._getCreateCartPayload(cartName, isDefault));
  }

  all() {
    return this.getRequest('carts');
  }

  get(idCart) {
    return this.getRequest(`carts/${idCart}`);
  }

  getWithItems(idCart) {
    return this.getRequest(`carts/${idCart}?include=items`);
  }

  _getCreateCartPayload(cartName, isDefault = false) {
    return {
      data: {
        type: 'carts',
        attributes: {
          name: cartName,
          priceMode: 'GROSS_MODE',
          currency: 'EUR',
          store: 'DE',
          isDefault: isDefault,
        },
      },
    };
  }
}
