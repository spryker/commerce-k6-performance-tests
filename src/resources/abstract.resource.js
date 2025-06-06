import { check } from 'k6';
import http from 'k6/http';
import EnvironmentUtil from '../utils/environment.util';
import { addErrorToCounter } from '../utils/metric.util';

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

    addErrorToCounter(check(response, { [`[POST] ${fullUrl} was successful.`]: (r) => r.status === 201 }));

    if (response.status !== 201) {
      console.log(response.body);
    }

    return response;
  }

  deleteRequest(resourceUrl) {
    const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
    const response = http.del(fullUrl, null, { headers: this.headers });

    addErrorToCounter(check(response, { [`[DELETE] ${fullUrl} was successful.`]: (r) => r.status === 204 }));

    return response;
  }

  getRequest(resourceUrl) {
    const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
    const response = http.get(fullUrl, { headers: this.headers });

    addErrorToCounter(check(response, { [`[GET] ${fullUrl} was successful.`]: (r) => r.status === 200 }));

    return response;
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
