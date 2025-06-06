import AbstractResource from './abstract.resource';

export default class CatalogSearchResource extends AbstractResource {
  get(queryParams = {}) {
    let queryStringData = [];
    let queryString = '';
    if (Object.keys(queryParams).length > 0) {
      for (const key in queryParams) {
        queryStringData.push(`${key}=${queryParams[key]}`);
      }

      queryString = '?' + queryStringData.join('&');
    }

    return this.getRequest(`catalog-search${queryString}`);
  }
}
