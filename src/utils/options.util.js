import EnvironmentUtil from '../utils/environment.util.js';

export default class OptionsUtil {
  static loadOptions(options, thresholds) {
    const k6Options = {
      thresholds: thresholds,
      setupTimeout: options.setupTimeout || '10s',
      scenarios: {
        default: {},
      },
    };

    k6Options.scenarios.default = EnvironmentUtil.getDefaultTestConfiguration(options);

    return k6Options;
  }
}
