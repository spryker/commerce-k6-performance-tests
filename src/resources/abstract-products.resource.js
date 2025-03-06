import AbstractResource from './abstract.resource';

export default class AbstractProductsResource extends AbstractResource {
  getWithAllIncludes(sku) {
    return this.getRequest(
      `abstract-products/${sku}?include=abstract-product-image-sets,concrete-products,abstract-product-availabilities,abstract-product-prices,category-nodes,product-labels,product-tax-sets,product-reviews,product-options`
    );
  }
}
