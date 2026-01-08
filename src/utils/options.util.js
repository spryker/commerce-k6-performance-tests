import EnvironmentUtil from '../utils/environment.util.js';

export default class OptionsUtil {
  static loadOptions(options, thresholds) {
    const k6Options = {
      thresholds: thresholds,
      setupTimeout: options.setupTimeout || '90s',
      scenarios: {
        default: {},
      },
      cloud: {
        distribution: {
          distributionLabel1: { loadZone: 'amazon:de:frankfurt', percent: 100 },
          },
      },
    };

    k6Options.scenarios.default = EnvironmentUtil.getDefaultTestConfiguration(options);

    return k6Options;
  }
}
