import http from 'k6/http';
import encoding from 'k6/encoding';
import { debug } from './utils.js';

export class Http {
  constructor() {
    this.authorizationHeader = this._getAuthorizationHeader();
  }

  sendGetRequest(url, params = {}, withBasicAuthorization = true) {
    params = this._addAuthorizationHeader(params, withBasicAuthorization);

    return http.get(url, params);
  }

  submitForm(response, formData) {
    if (!formData.params) {
      formData.params = {};
    }

    formData.params = this._addAuthorizationHeader(formData.params);
    formData.params.redirects = 0;

    if (response.url && formData.params.headers && !formData.params.headers.Referer) {
      formData.params.headers.Referer = response.url;
    }

    return response.submitForm(formData);
  }

  sendPostRequest(url, body, params = {}, withBasicAuthorization = true) {
    params = this._addAuthorizationHeader(params, withBasicAuthorization);
    debug('sendPostRequest', url, body, params);

    return http.post(url, body, params);
  }

  sendPatchRequest(url, body, params = {}, withBasicAuthorization = true) {
    params = this._addAuthorizationHeader(params, withBasicAuthorization);
    debug('sendPatchRequest', url, body, params);

    return http.patch(url, body, params);
  }

  sendPutRequest(url, body, params = {}, withBasicAuthorization = true) {
    params = this._addAuthorizationHeader(params, withBasicAuthorization);
    debug('sendPutRequest', url, body, params);

    return http.put(url, body, params);
  }

  sendDeleteRequest(url, body, params = {}, withBasicAuthorization = true) {
    params = this._addAuthorizationHeader(params, withBasicAuthorization);
    debug('sendDeleteRequest', url, body, params);

    return http.del(url, body, params);
  }

  _getAuthorizationHeader() {
    const username = __ENV.BASIC_AUTH_USERNAME;
    const password = __ENV.BASIC_AUTH_PASSWORD;

    if (!username || !password) {
      return null;
    }

    return `Basic ${encoding.b64encode(`${username}:${password}`)}`;
  }

  _addAuthorizationHeader(params, withBasicAuthorization = true) {
    if (this.authorizationHeader && withBasicAuthorization) {
      if (!params.headers) {
        params.headers = {};
      }

      params.headers.Authorization = this.authorizationHeader;
    }

    return params;
  }

  url(parts, ...pieces) {
    if (pieces.length && pieces[0].startsWith('http')) {
      parts = [...parts];
      parts.shift();
      parts[0] = pieces[0] + parts[0];
      pieces.shift();
    }

    return http.url(parts, ...pieces);
  }
}
