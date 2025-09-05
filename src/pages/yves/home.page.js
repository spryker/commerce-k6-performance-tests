import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';

export default class HomePage extends AbstractPage {
  get() {
    const fullUrl = `${EnvironmentUtil.getStorefrontUrl()}/`;
    const response = http.get(fullUrl);

    addErrorToCounter(
      check(response, {
        'Home Page was successful': (r) => r.status === 200 && r.body,
      })
    );

    return response;
  }
}
