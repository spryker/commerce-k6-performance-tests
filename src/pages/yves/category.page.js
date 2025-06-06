import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class CategoryPage extends AbstractPage {
  get(url, queryParams = {}) {
    let queryStringData = [];
    let queryString = '';
    if (queryParams !== {}) {
      for (const key in queryParams) {
        queryStringData.push(`${key}=${queryParams[key]}`);
      }

      queryString = '?' + queryStringData.join('&');
    }

    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/${url}${queryString}`;
    const response = http.get(fullUrl);

    addErrorToCounter(
      check(response, {
        [`Category with filters ${fullUrl} was successful`]: (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }
}
