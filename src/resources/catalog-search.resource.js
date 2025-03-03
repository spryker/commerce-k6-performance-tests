import AbstractResource from './abstract.resource';

export default class CatalogSearchResource extends AbstractResource {
  get(sku) {
    return this.getRequest(`catalog-search?q=${sku}`);
  }
}
