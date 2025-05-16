import EnvironmentUtil from './environment.util';

export default class OptionsUtil {
  static loadOptions(testConfiguration, testThresholds) {
    let options = this._getDefaultOptions();

    options.tags = {};
    options.thresholds = {};
    options.scenarios = {};

    testConfiguration.metrics.forEach((metric) => {
      options.thresholds[metric] = testThresholds[metric];
    });

    options.scenarios.default = this._createDefaultScenario(testConfiguration);

    if (EnvironmentUtil.getTestType() === 'soak') {
      options.stages = testConfiguration.stages;
    }

    return options;
  }

  static _getDefaultOptions() {
    return {
      setupTimeout: '240s',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      thresholds: {
        http_req_failed: ['rate == 0.00'],
        checks: ['rate == 1.0'],
      },
    };
  }

  static _createDefaultScenario(testConfiguration) {
    return {
      tags: {
        testId: testConfiguration.id,
        testGroup: testConfiguration.group,
      },
      executor: testConfiguration.executor,
      vus: testConfiguration.vus,
      iterations: testConfiguration.iterations,
      maxDuration: testConfiguration.maxDuration,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    };
  }
}
