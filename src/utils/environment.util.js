export default class EnvironmentUtil {

    static getStorefrontUrl() {
        switch (__ENV.K6_HOSTENV) {
        case 'local':
            return 'http://yves.eu.spryker.local'
        default:
            console.error('Url or env not defined')
        }
    }

    static getStorefrontApiUrl() {
        switch (__ENV.K6_HOSTENV) {
        case 'local':
            return 'http://glue.eu.spryker.local'
        default:
            console.error('Url or env not defined')
        }
    }

    static getBackendApiUrl() {
        switch (__ENV.K6_HOSTENV) {
        case 'local':
            return 'http://glue-backend.eu.spryker.local'
        default:
            console.error('Url or env not defined')
        }
    }

    static getBackofficeUrl() {
        switch (__ENV.K6_HOSTENV) {
        case 'local':
            return 'http://backoffice.eu.spryker.local'
        default:
            console.error('Url or env not defined')
        }
    }

    static getBackofficeApiUrl() {
        switch (__ENV.K6_HOSTENV) {
        case 'local':
            return 'http://backend-api.eu.spryker.local'
        default:
            console.error('Url or env not defined')
        }
    }

    static getVus() {
        switch (__ENV.ENV_REPOSITORY_TYPE) {
        case 'smoke':
            return 1
        case 'load':
            return 10
        default:
            console.error('Vus not defined')
        }
    }

    static getIterations() {
        switch (__ENV.ENV_REPOSITORY_TYPE) {
        case 'smoke':
            return 10
        case 'load':
            return 1
        default:
            console.error('Vus not defined')
        }
    }

    static getExecutor() {
        return 'per-vu-iterations'
    }
}
