import AbstractResource from './abstract.resource';
import EnvironmentUtil from '../utils/environment.util';

const B2B_MP_MERCHANT_REFERENCE = 'MER000008';

export default class ShoppingListsResource extends AbstractResource {
  constructor(bearerToken) {
    super(bearerToken);
  }

  all() {
    return this.getRequest('shopping-lists');
  }

  create(name) {
    return this.postRequest('shopping-lists', this._getCreateShoppingListPayload(name));
  }

  delete(id) {
    return this.deleteRequest(`shopping-lists/${id}`);
  }

  get(id, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`shopping-lists/${id}` + includeParam);
  }

  addItem(idShoppingList, sku, quantity = 1, productOfferReference = null) {
    const payload = this._getShoppingListItemsPayload(sku, quantity, productOfferReference);

    return this.postRequest(`shopping-lists/${idShoppingList}/shopping-list-items`, payload, {
      redirects: 0,
    });
  }

  _getCreateShoppingListPayload(name) {
    return {
      data: {
        type: 'shopping-lists',
        attributes: {
          name: name,
        },
      },
    };
  }

  _getShoppingListItemsPayload(sku, quantity, productOfferReference = null) {
    let payload = {
      data: {
        type: 'shopping-list-items',
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
