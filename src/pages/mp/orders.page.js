import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class OrdersPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  all() {
    const ordersUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/orders`;
    const ordersResponse = http.get(ordersUrl, { headers: this.headers });

    addErrorToCounter(
      check(ordersResponse, {
        'Orders was successful': (r) => r.status === 200 && r.body,
      })
    );

    const ordersTableResponse = this.tableData();

    return (ordersResponse.timings.duration + ordersTableResponse.timings.duration) * 1.05;
  }

  tableData() {
    const ordersTableUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/orders/table-data`;
    const ordersTableResponse = http.get(ordersTableUrl, { headers: this.headers });

    addErrorToCounter(
      check(ordersTableResponse, {
        'Orders Table was successful': (r) => r.status === 200 && r.body && JSON.stringify(r.body).includes('DE--'),
      })
    );

    return ordersTableResponse;
  }

  get(merchantOrderId) {
    const orderDetailUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/detail?merchant-order-id=${merchantOrderId}`;
    const orderDetailResponse = http.get(orderDetailUrl, { headers: this.headers });

    addErrorToCounter(
      check(orderDetailResponse, {
        'Order detail was successful': (r) => r.status === 200 && r.body,
      })
    );

    const itemListTableResponse = this.itemListTable(merchantOrderId);

    return (orderDetailResponse.timings.duration + itemListTableResponse.timings.duration) * 1.05;
  }

  itemListTable(merchantOrderId) {
    const itemListTableUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/item-list/table-data?merchant-order-item-ids=${merchantOrderId}&merchant-order-id=${merchantOrderId}`;
    const itemListTableResponse = http.get(itemListTableUrl, { headers: this.headers });

    addErrorToCounter(
      check(itemListTableResponse, {
        'Item List Table was successful': (r) => r.status === 200 && r.body,
      })
    );

    return itemListTableResponse;
  }

  totalItemList(merchantOrderId) {
    const totalItemListUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/detail/total-item-list?merchant-order-id=${merchantOrderId}`;
    const totalItemListResponse = http.get(totalItemListUrl, { headers: this.headers });

    addErrorToCounter(
      check(totalItemListResponse, {
        'Total Item List was successful': (r) => r.status === 200 && r.body,
      })
    );

    return totalItemListResponse;
  }

  triggerEvent(merchantOrderId, event) {
    const eventName = event.replaceAll(' ', '%20');
    const triggerEventUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/sales-merchant-portal-gui/trigger-merchant-oms?merchant-order-id=${merchantOrderId}&event-name=${eventName}`;
    console.log(triggerEventUrl);
    console.log(this.headers);
    const triggerEventResponse = http.get(triggerEventUrl, { headers: this.headers });

    console.log(triggerEventResponse);

    addErrorToCounter(
      check(triggerEventResponse, {
        [`Event '${event}' was triggered successfully`]: (r) => r.status === 200 && r.body,
      })
    );

    return triggerEventResponse;
  }
}
