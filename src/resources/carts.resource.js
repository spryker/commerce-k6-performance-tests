import EnvironmentUtil from '../utils/environment.util';
import AbstractResource from './abstract.resource';

const B2B_MP_MERCHANT_REFERENCE = 'MER000008';

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

  get(idCart, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`carts/${idCart}` + includeParam);
  }

  addItem(idCart, sku, quantity = 1, productOfferReference = null) {
    const payload = this._getCartsItemsPayload(sku, quantity, productOfferReference);

    return this.postRequest(`carts/${idCart}/items`, payload, {
      redirects: 0,
    });
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

  _getCartsItemsPayload(sku, quantity, productOfferReference = null) {
    let payload = {
      data: {
        type: 'items',
        attributes: {
          sku: sku,
          quantity: quantity,
        },
      },
    };

    if (EnvironmentUtil.getRepositoryId() === 'b2b-mp' && productOfferReference) {
      payload.data.attributes.product_offer_reference = productOfferReference;
    }

    if (EnvironmentUtil.getRepositoryId() === 'b2b-mp' && EnvironmentUtil.getUseStaticFixtures()) {
      payload.data.attributes.merchant_reference = B2B_MP_MERCHANT_REFERENCE;
    }

    return payload;
  }
}
