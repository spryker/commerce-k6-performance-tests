import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class CatalogPage extends AbstractPage {
  search({ sku, name }) {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/search?q=${sku}`;
    const response = http.get(fullUrl);

    addErrorToCounter(
      check(response, {
        [`Catalog [${fullUrl}] search was successful`]: (r) => r.status === 200 && r.body && r.body.includes(name),
      })
    );

    return response;
  }
}
