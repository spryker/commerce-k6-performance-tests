import { check } from 'k6';
import http from 'k6/http';
import EnvironmentUtil from '../utils/environment.util.js';

export default class AbstractResource {
  constructor(bearerToken = null) {
    this.bearerToken = bearerToken;
    this.headers = {
      Accept: 'application/json',
      ...(this.bearerToken && { Authorization: this.bearerToken }),
    };
  }

  postRequest(resourceUrl, payload) {
    const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
    const response = http.post(fullUrl, JSON.stringify(payload), { headers: this.headers });

    check(response, { [`[POST] ${fullUrl} was successful.`]: (r) => r.status === 201 });

    return response;
  }

  deleteRequest(resourceUrl) {
    const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
    return http.del(fullUrl, null, { headers: this.headers });
  }

  getRequest(resourceUrl) {
    const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
    return http.get(fullUrl, { headers: this.headers });
  }

  runConsoleCommands(commands) {
    return http.post(
      http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`,
      JSON.stringify(this._getConsoleCommandsPayload(commands)),
      {
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }
    );
  }

  _getConsoleCommandsPayload(commands) {
    const operations = commands.map((command) => {
      return {
        type: 'cli-command',
        name: command,
      };
    });

    return {
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          operations: operations,
        },
      },
    };
  }
}
