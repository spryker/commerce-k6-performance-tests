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
        const availableStores = this.environmentConfig.stores;

        if (!availableStores) {
            throw new Error('Stores are not defined.');
        }

        const store = __ENV.STORE ? availableStores.find(store => store.toLowerCase() === __ENV.STORE.toLowerCase()) : availableStores[0];

        if (!store) {
            throw new Error(`Store not found. Target store: ${__ENV.STORE}, available stores: ${availableStores.join(',')}`);
        }

        return url.replace('%store%', store).replace('%STORE%', store.toUpperCase());
    }
}
