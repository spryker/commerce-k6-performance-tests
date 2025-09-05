import AbstractResource from './abstract.resource';

export default class AbstractProductsResource extends AbstractResource {
  get(sku, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`abstract-products/${sku}` + includeParam);
  }
}
