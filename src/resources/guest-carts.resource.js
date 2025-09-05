import EnvironmentUtil from '../utils/environment.util';
import AbstractResource from './abstract.resource';

const B2B_MP_MERCHANT_REFERENCE = 'MER000008';

export default class GuestCartsResource extends AbstractResource {
  constructor(anonymousCustomerUniqueId = null) {
    super(null, anonymousCustomerUniqueId);
  }

  create(cartName, isDefault = false) {
    return this.postRequest('guest-carts', this._getGuestCreateCartPayload(cartName, isDefault));
  }

  all() {
    return this.getRequest('guest-carts');
  }

  get(idCart, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`guest-carts/${idCart}` + includeParam);
  }

  addItem(idCart = null, sku, quantity = 1, productOfferReference = null) {
    const payload = this._getGuestCartItemsPayload(sku, quantity, productOfferReference);

    if (!idCart) {
      return this.postRequest('guest-cart-items', payload, {
        redirects: 0,
      });
    }

    return this.postRequest(`guest-carts/${idCart}/guest-items`, payload, {
      redirects: 0,
    });
  }

  _getGuestCreateCartPayload(cartName) {
    return {
      data: {
        type: 'guest-carts',
        attributes: {
          name: cartName,
          priceMode: 'GROSS_MODE',
          currency: 'EUR',
          store: 'DE',
        },
      },
    };
  }

  _getGuestCartItemsPayload(sku, quantity, productOfferReference = null) {
    let payload = {
      data: {
        type: 'guest-cart-items',
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
