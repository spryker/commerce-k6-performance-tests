import AbstractResource from './abstract.resource';

export default class ConcreteProductsResource extends AbstractResource {
  get(sku, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`concrete-products/${sku}` + includeParam);
  }
}
