import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';

const B2B_MP_MERCHANT_REFERENCE = 'MER000008';

export default class CartPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  get() {
    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/cart`, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        'Cart was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  addItem(sku, token, productOfferReference = null) {
    const payload = this._getAddToCartPayload(token, productOfferReference);

    let params = {
      redirects: 0,
    };

    if (this.headers) {
      params.headers = this.headers;
    }

    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/cart/add/${sku}`, payload, params);

    addErrorToCounter(
      check(response, {
        [`Add item to cart [${EnvironmentUtil.getStorefrontUrl()}/cart/add/${sku}] was successful`]: (r) =>
          r.status === 302 && r.body,
      })
    );

    return response;
  }

  _getAddToCartPayload(token, productOfferReference = null) {
    let payload = {
      quantity: 1,
      'add_to_cart_form[_token]': token,
    };

    if (EnvironmentUtil.getRepositoryId() === 'b2b-mp' && productOfferReference) {
      payload.product_offer_reference = productOfferReference;
    }

    if (EnvironmentUtil.getRepositoryId() === 'b2b-mp' && EnvironmentUtil.getUseStaticFixtures()) {
      payload.merchant_reference = B2B_MP_MERCHANT_REFERENCE;
    }

    return payload;
  }
}
