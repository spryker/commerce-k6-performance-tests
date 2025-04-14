import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class OrderPage extends AbstractPage {
  constructor(headers) {
    super();
    this.headers = headers;
  }

  all() {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/customer/order`;
    const response = http.get(fullUrl, { headers: this.headers });

    addErrorToCounter(
      check(response, {
        '/customer/order was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }

  cancel(orderId) {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/order/cancel?id-sales-order=${orderId}&return-url=/customer/order`;
    const response = http.post(fullUrl, null, { headers: this.headers, redirects: 0 });

    addErrorToCounter(
      check(response, {
        'Order cancel was successful': (r) => r.status === 302 && r.body,
      })
    );

    return response;
  }
}
