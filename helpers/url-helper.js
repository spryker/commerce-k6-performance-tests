export class UrlHelper {
    constructor(environmentConfig) {
        this.environmentConfig = environmentConfig;
    }

    getStorefrontBaseUrl() {
        return this._replaceUrlStore(this.environmentConfig.storefrontUrl);
    }

    getStorefrontApiBaseUrl() {
        return this._replaceUrlStore(this.environmentConfig.storefrontApiUrl);
    }

    getBackofficeBaseUrl() {
        return this._replaceUrlStore(this.environmentConfig.backofficeUrl);
    }

    getBackendApiBaseUrl() {
        return this._replaceUrlStore(this.environmentConfig.backendApiUrl);
    }

    getBackofficeApiBaseUrl() {
        return this._replaceUrlStore(this.environmentConfig.backofficeApiUrl);
    }

    _replaceUrlStore(url) {
        const store = String(__ENV.STORE ? __ENV.STORE : 'de').toLowerCase();

        if (!__ENV.STORE) {
            console.warn('Store is not defined so fallback to default store DE. Please use STORE environment variable to change this behaviour.');
        }

        return url.replace('%store%', store).replace('%STORE%', store.toUpperCase());
    }
}
