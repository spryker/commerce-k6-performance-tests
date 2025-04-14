import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';

export class DashboardPage {
  constructor(headers) {
    this.headers = headers;
  }

  get() {
    const response = http.get(`${EnvironmentUtil.getMerchantPortalUrl()}/dashboard-merchant-portal-gui/dashboard`, {
      headers: this.headers,
    });

    addErrorToCounter(
      check(response, {
        'Dashboard page status is 200': (r) => r.status === 200,
      })
    );

    return response;
  }
}
