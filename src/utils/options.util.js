import EnvironmentUtil from './environment.util';
import { createDefaultScenario } from './scenario.util';

export default class OptionsUtil {
  static loadOptions(testConfiguration, testThresholds) {
    const testType = EnvironmentUtil.getTestType();

    if (testType === 'smoke' || testType === 'load') {
      return this.loadSmokeLoadOptions(testConfiguration, testThresholds);
    }

    return this.loadSoakOptions(testConfiguration, testThresholds);
  }

  static loadSmokeLoadOptions(testConfiguration, testThresholds) {
    let options = this._getDefaultOptions();

    options.tags = {};
    options.thresholds = {};
    options.scenarios = {};

    testConfiguration.metrics.forEach((metric) => {
      options.thresholds[metric] = testThresholds[metric];
    });

    options.scenarios.default = createDefaultScenario(testConfiguration);

    return options;
  }

  static loadSoakOptions(testConfiguration, testThresholds) {
    let options = this._getDefaultOptions();

    options.thresholds = {};

    testConfiguration.metrics.forEach((metric) => {
      options.thresholds[metric] = testThresholds[metric];
    });

    options.stages = testConfiguration.stages;

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
}
