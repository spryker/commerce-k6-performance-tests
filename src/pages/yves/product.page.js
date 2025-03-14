import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class ProductPage extends AbstractPage {
  get(url) {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/${url}`;
    const response = http.get(fullUrl);
    console.log('url', fullUrl);

    addErrorToCounter(
      check(response, {
        'Product detail page was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }
}
