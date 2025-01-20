import http from 'k6/http';
import { check } from 'k6';
import EnvironmentUtil from '../utils/environment.util';

export class AbstractFixture {
  runDynamicFixture(payload) {
    const res = http.post(http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`, payload, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });

    check(res, { 'Fixtures generated successfully.': (r) => r.status === 201 });

    return res;
  }

  static runConsoleCommands(commands) {
    const operations = commands.map((command) => {
      return {
        type: 'cli-command',
        name: command,
      };
    });

    const payload = {
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          operations: operations,
        },
      },
    };

    return http.post(http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`, payload, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
  }
}
