export default class UrlUtil {

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
}