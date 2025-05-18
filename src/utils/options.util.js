import EnvironmentUtil from '../utils/environment.util';

export default class OptionsUtil {
  static loadOptions(options, thresholds) {
    const k6Options = {
      thresholds: thresholds,
      scenarios: {
        default: {}
      }
    };

    k6Options.scenarios.default = EnvironmentUtil.getDefaultTestConfiguration();

    return k6Options;
  }
}
