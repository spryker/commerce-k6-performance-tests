import AbstractResource from './abstract.resource';

export default class CategoryTreesResource extends AbstractResource {
  all() {
    return this.getRequest('category-trees');
  }
}
