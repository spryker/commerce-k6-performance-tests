import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';

export default class CatalogPage extends AbstractPage {
  search(query) {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/search?q=${query}`;

    return http.get(fullUrl);
  }
}
