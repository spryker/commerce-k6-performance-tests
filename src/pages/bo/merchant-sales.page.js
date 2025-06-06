import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class MerchantSalesPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  all() {
    const merchantSalesUrl = `${EnvironmentUtil.getBackofficeUrl()}/merchant-sales-order-merchant-user-gui`;
    const merchantSalesResponse = http.get(merchantSalesUrl, { headers: this.headers });

    addErrorToCounter(
      check(merchantSalesResponse, {
        'Merchant Sales was successful': (r) => r.status === 200 && r.body,
      })
    );

    return merchantSalesResponse;
  }
}
