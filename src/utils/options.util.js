import { createScenario } from './scenario.util';

export default class OptionsUtil {
  static loadOptions(testConfiguration, testThresholds) {
    let options = this._getDefaultOptions();

    if (options.tags === undefined) {
      options.tags = {};
    }

    let tags = {
      gitRepository: this._getRequiredEnvVariable('GIT_REPO'),
      gitBranch: this._getRequiredEnvVariable('GIT_BRANCH'),
      gitCommit: this._getRequiredEnvVariable('GIT_HASH'),
      gitTag: __ENV.GIT_TAG,
      testRunId: this._getRequiredEnvVariable('SPRYKER_TEST_RUN_ID'),
      testRunnerHostName: this._getRequiredEnvVariable('SPRYKER_TEST_RUNNER_HOSTNAME'),
    };

    // Adds the git* tags if they are NOT already present.
    Object.assign(options.tags, Object.fromEntries(Object.entries(tags).filter(([key]) => !(key in options.tags))));

    options.thresholds = {};
    options.scenarios = {};

    // Assign thresholds for each metric
    testConfiguration.metrics.forEach((metric) => {
      options.thresholds[metric] = testThresholds[metric];
    });

    // Create a single scenario
    options.scenarios.default = createScenario({
      testId: testConfiguration.id,
      testGroup: testConfiguration.group,
    });

    return options;
  }

  static _getRequiredEnvVariable(variableName) {
    if (!eval(`__ENV.${variableName}`)) {
      throw new Error(`${variableName} env variable must be specified.`);
    }

    return eval(`__ENV.${variableName}`);
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
