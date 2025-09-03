import AbstractResource from './abstract.resource';

export default class CategoryNodesResource extends AbstractResource {
  get(idCategoryNode, includes = []) {
    let includeParam = '';
    if (includes.length > 0) {
      includeParam = '?include=' + includes.join(',');
    }

    return this.getRequest(`category-nodes/${idCategoryNode}` + includeParam);
  }
}
