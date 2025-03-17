import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';

export default class CartPage extends AbstractPage {
  constructor(headers) {
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
}
