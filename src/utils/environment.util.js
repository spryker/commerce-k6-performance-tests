export default class EnvironmentUtil {
  static getStorefrontUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://yves.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_STOREFRONT_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getMerchantPortalUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://mp.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_MERCHANT_PORTAL_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getStorefrontApiUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://glue.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_STOREFRONT_API_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getBackendApiUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://glue-backend.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_BACKEND_API_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getBackofficeUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://backoffice.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_BACKOFFICE_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getBackofficeApiUrl() {
    switch (__ENV.K6_HOSTENV) {
      case 'local':
        return 'http://backend-api.eu.spryker.local';
      case 'staging':
        return __ENV.SPRYKER_BACKOFFICE_API_URL;
      default:
        console.error('Url or env not defined');
    }
  }

  static getVus() {
    switch (this.getTestType()) {
      case 'smoke':
        return 1;
      case 'load':
        return 10;
      default:
        console.error('Vus not defined');
    }
  }

  static getIterations() {
    switch (this.getTestType()) {
      case 'smoke':
        return 10;
      case 'load':
        return 1;
      default:
        console.error('Vus not defined');
    }
  }

  static getTestType() {
    return __ENV.SPRYKER_TEST_TYPE;
  }

  static getExecutor() {
    return 'per-vu-iterations';
  }

  static getDefaultTestConfiguration() {
    return {
      vus: EnvironmentUtil.getVus(),
      iterations: EnvironmentUtil.getIterations(),
      executor: EnvironmentUtil.getExecutor(),
      maxDuration: '60m',
    };
  }

  static getRepositoryId() {
    return __ENV.SPRYKER_REPOSITORY_ID;
  }
}
