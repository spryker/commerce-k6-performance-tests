import AbstractResource from './abstract.resource';

export default class CatalogSearchResource extends AbstractResource {
  constructor() {
    super();
  }

  get(sku) {
    return this.getRequest(`catalog-search?q=${sku}`);
  }
}
