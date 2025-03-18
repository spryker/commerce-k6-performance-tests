import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';

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

  addItem(sku) {
    const payload = this._getAddToCartPayload();

    let params = {
      redirects: 0,
    };

    if (this.headers) {
      params.headers = this.headers;
    }

    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/cart/add/${sku}`, payload, params);

    addErrorToCounter(
      check(response, {
        'Add item to cart was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }

  _getAddToCartPayload() {
    return {
      quantity: 1,
    };
  }
}
