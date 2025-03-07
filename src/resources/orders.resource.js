import AbstractResource from './abstract.resource';

export default class OrdersResource extends AbstractResource {
  get() {
    return this.getRequest('orders');
  }

  getDetails(orderId, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`orders/${orderId}` + includeParam);
  }
}
