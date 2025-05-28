import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class ProductPage extends AbstractPage {
  get(url) {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/${url}`;
    const response = http.get(fullUrl, { redirects: 0 });

    addErrorToCounter(
      check(response, {
        'Product detail page was successful': (r) => {
            if (r.status !== 200) {
                console.error(`Failed to load product page: ${fullUrl} with status ${r.status}`);
            }
          return r.status === 200 && r.body
        },
      })
    );

    return response;
  }
}
