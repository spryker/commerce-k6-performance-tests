import AbstractResource from './abstract.resource';

export default class OrdersResource extends AbstractResource {
  all() {
    return this.getRequest('orders');
  }

  get(orderId, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`orders/${orderId}` + includeParam);
  }
}
