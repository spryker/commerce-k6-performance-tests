import EnvironmentUtil from '../../utils/environment.util';
import http from 'k6/http';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import AbstractPage from '../abstract.page';
import { parseHTML } from 'k6/html';

const DEFAULT_PASSWORD = 'change123';

export class LoginPage extends AbstractPage {
  constructor(email, password = null) {
    super();
    this.email = email;
    this.password = password || DEFAULT_PASSWORD;
    this.headers = null;
  }

  login() {
    const loginPageCsrfToken = this.getLoginPageToken();

    const payload = {
      'loginForm[email]': this.email,
      'loginForm[password]': this.password,
      'loginForm[_token]': loginPageCsrfToken,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: `${EnvironmentUtil.getStorefrontUrl()}/login`,
    };

    const params = {
      headers: headers,
      redirects: 0,
    };

    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/en/login_check`, payload, params);
    let sessionCookie = this.extractSessionCookie(response);

    if (!sessionCookie) {
      console.log('Session cookie not found, retrying login...');

      const retryResponse = http.post(`${EnvironmentUtil.getStorefrontUrl()}/en/login_check`, payload, params);
      addErrorToCounter(
        check(retryResponse, {
          'Login was successful': (r) => r.status === 302,
        })
      );

      sessionCookie = this.extractSessionCookie(retryResponse);
    } else {
      addErrorToCounter(
        check(response, {
          'Login was successful': (r) => r.status === 302,
        })
      );
    }

    return {
      Cookie: sessionCookie,
    };
  }

  extractSessionCookie(response) {
    if (!response.headers['Set-Cookie']) {
      console.log('No Set-Cookie header found in response');
      return '';
    }

    const cookies = response.headers['Set-Cookie'].split(';');

    return cookies.find((cookie) => cookie.includes(`${EnvironmentUtil.getStorefrontSessionCookieName()}=`)) || '';
  }

  logout(headers) {
    const params = {
      headers: headers,
      redirects: 0,
    };

    const response = http.get(`${EnvironmentUtil.getStorefrontUrl()}/logout`, params);

    addErrorToCounter(
      check(response, {
        'Logout was successful': (r) => r.status === 302,
      })
    );

    return response;
  }

  getLoginPageToken() {
    const loginPageResponse = http.get(`${EnvironmentUtil.getStorefrontUrl()}/en/login`);

    return parseHTML(loginPageResponse.body).find('#loginForm__token"]').attr('value');
  }
}
