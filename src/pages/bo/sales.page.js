import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class SalesPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  all() {
    const salesUrl = `${EnvironmentUtil.getBackofficeUrl()}/sales`;
    const salesResponse = http.get(salesUrl, { headers: this.headers });

    addErrorToCounter(
      check(salesResponse, {
        'Sales was successful': (r) => r.status === 200 && r.body,
      })
    );

    const salesTableResponse = this.table();

    return (salesResponse.timings.duration + salesTableResponse.timings.duration) * 1.05;
  }

  table(params = {}) {
    let queryString = '?';
    params.draw = 1;
    for (const key in params) {
      queryString += `${key}=${params[key]}&`;
    }
    queryString = queryString.slice(0, -1);

    const salesTableUrl = `${EnvironmentUtil.getBackofficeUrl()}/sales/index/table${queryString}`;
    const salesTableResponse = http.get(salesTableUrl, { headers: this.headers });

    addErrorToCounter(
      check(salesTableResponse, {
        'Sales table was successful': (r) => r.status === 200 && r.body,
      })
    );

    return salesTableResponse;
  }

  get(orderId) {
    const salesDetailUrl = `${EnvironmentUtil.getBackofficeUrl()}/sales/detail?id-sales-order=${orderId}`;
    const salesDetailResponse = http.get(salesDetailUrl, { headers: this.headers });

    addErrorToCounter(
      check(salesDetailResponse, {
        'Sales detail was successful': (r) => r.status === 200 && r.body,
      })
    );

    return salesDetailResponse;
  }

  triggerEvent(orderId, event, omsTriggerFormToken) {
    const payload = {
      'oms_trigger_form[_token]': omsTriggerFormToken,
    };

    const triggerEventUrl = `${EnvironmentUtil.getBackofficeUrl()}/oms/trigger/submit-trigger-event-for-order?event=${event}&id-sales-order=${orderId}&redirect=/sales/detail?id-sales-order=${orderId}`;
    const triggerEventResponse = http.post(triggerEventUrl, payload, { headers: this.headers, redirects: 0 });

    addErrorToCounter(
      check(triggerEventResponse, {
        [`Event ${event} was triggered successfully`]: (r) => r.status === 302 && r.body,
      })
    );

    return triggerEventResponse;
  }

  retrieveOrderIdByReference(orderReference) {
    const salesTableResponse = this.table({ 'search[value]': orderReference });

    addErrorToCounter(
      check(salesTableResponse, {
        'Sales Table contains order reference': (r) =>
          r.status === 200 && r.body && JSON.parse(r.body).recordsFiltered > 0,
      })
    );

    return JSON.parse(salesTableResponse.body).data[0][0];
  }
}
