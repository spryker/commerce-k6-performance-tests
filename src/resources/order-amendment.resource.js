import AbstractResource from './abstract.resource';
import KSixError from '../utils/k-six-error';

export default class OrderAmendmentResource extends AbstractResource {
  constructor(orderReference, bearerToken = null) {
    super(bearerToken);
    this.orderReference = orderReference;
  }

  amendOrder() {
    this._ensureConcreteOrderState('grace period started');

    return this.postRequest('cart-reorder', this._getCartReorderPayload());
  }

  _ensureConcreteOrderState(state, maxRetries = 5) {
    let retries = 0;
    let order;

    do {
      order = this._getCurrentOrder();
      if (order.data.attributes.itemStates[0] !== state) {
        this.runConsoleCommands(['vendor/bin/console oms:check-condition', 'vendor/bin/console oms:check-timeout']);
      }
      retries++;
    } while (order.data.attributes.itemStates[0] !== state && retries < maxRetries);

    if (retries === maxRetries) {
      throw new KSixError(`Order state is not ${state} after ${maxRetries} retries`);
    }
  }

  _getCurrentOrder() {
    const orderResponse = this.getRequest(`orders/${this.orderReference}`);

    return JSON.parse(orderResponse.body);
  }

  _getCartReorderPayload() {
    return {
      data: {
        type: 'cart-reorder',
        attributes: {
          orderReference: this.orderReference,
          isAmendment: true,
        },
      },
    };
  }
}
