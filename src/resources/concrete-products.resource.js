import AbstractResource from './abstract.resource';

export default class ConcreteProductsResource extends AbstractResource {
  get(sku) {
    return this.getRequest(`concrete-products/${sku}`);
  }
}
