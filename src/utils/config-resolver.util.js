import EnvironmentUtil from './environment.util';

export default class ConfigResolver {
  constructor({ params }) {
    this.testType = EnvironmentUtil.getTestType();
    this.params = params;
  }

  resolveConfig() {
    switch (this.testType) {
      case 'soak':
        return this.getSoakConfiguration();
      default:
        return this.getSmokeLoadConfiguration();
    }
  }

  getSmokeLoadConfiguration() {
    return { ...EnvironmentUtil.getDefaultTestConfiguration(), ...this.params };
  }

  getSoakConfiguration() {
    return { ...EnvironmentUtil.getDefaultSoakTestConfiguration(), ...this.params };
  }
}
