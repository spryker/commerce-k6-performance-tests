import EnvironmentUtil from '../../utils/environment.util';
import http from 'k6/http';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import AbstractPage from '../abstract.page';

const DEFAULT_EMAIL = 'admin@spryker.com';
const DEFAULT_PASSWORD = 'change123';

export class LoginPage extends AbstractPage {
  constructor(email = null, password = null) {
    super();
    this.email = email || DEFAULT_EMAIL;
    this.password = password || DEFAULT_PASSWORD;
    this.headers = null;
  }

  login() {
    const payload = {
      'auth[username]': this.email,
      'auth[password]': this.password,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const params = {
      headers: headers,
      redirects: 0,
    };

    const response = http.post(`${EnvironmentUtil.getBackofficeUrl()}/security-gui/login`, payload, params);

    addErrorToCounter(
      check(response, {
        'Login was successful': (r) => r.status === 302,
      })
    );

    const sessionCookie = this.extractSessionCookie(response);

    return {
      Cookie: sessionCookie,
    };
  }

  extractSessionCookie(response) {
    const cookies = response.headers['Set-Cookie'].split(';');

    return cookies.find((cookie) => cookie.includes(`${EnvironmentUtil.getBackofficeSessionCookieName()}=`));
  }
}
