import { Http } from '../lib/http.js';
import { loadEnvironmentConfig } from '../lib/utils.js';
import { CartHelper } from '../helpers/cart-helper.js';
import { StorefrontHelper } from '../helpers/storefront-helper.js';
import { BrowserHelper } from '../helpers/browser-helper.js';
import { UrlHelper } from '../helpers/url-helper.js';
import { Trend } from 'k6/metrics';
import CustomerHelper from '../helpers/customer-helper.js';
import { AssertionsHelper } from '../helpers/assertions-helper.js';
import { BapiHelper } from '../helpers/bapi-helper.js';
import { AdminHelper } from '../helpers/admin-helper.js';

export class AbstractScenario {
    // eslint-disable-next-line no-unused-vars
    constructor(environment, options = {}) {
        if (this.constructor === AbstractScenario) {
            throw new Error('Abstract classes can\'t be instantiated.');
        }

        if (!environment) {
            throw new Error('Environment must be specified.');
        }

        this.environment = environment;

        this.http = new Http();
        this.environmentConfig = loadEnvironmentConfig(this.environment);
        this.urlHelper = new UrlHelper(this.environmentConfig);
        this.customerHelper = new CustomerHelper();
        this.assertionsHelper = new AssertionsHelper();
        this.browserHelper = new BrowserHelper(this.urlHelper, this.customerHelper, this.assertionsHelper);
        this.adminHelper = new AdminHelper(this.urlHelper, this.http, this.assertionsHelper, this.browserHelper);
        this.cartHelper = new CartHelper(this.urlHelper, this.http, this.customerHelper, this.assertionsHelper);
        this.bapiHelper = new BapiHelper(this.urlHelper, this.http, this.adminHelper, this.assertionsHelper);
        this.storefrontHelper = new StorefrontHelper(this.urlHelper, this.http, this.customerHelper, this.assertionsHelper);

    }

    createTrendMetric(name) {
        return new Trend(`${this.environment}.${name}`);
    }

    addResponseDurationToTrend(trend, response) {
        trend.add(
            response.timings.duration,
            {
                endpointUrl: response.url.toString(),
                gitHash: this._getRequiredEnvVariable('GIT_HASH'),
                gitBranch: this._getRequiredEnvVariable('GIT_BRANCH'),
                gitRepo: this._getRequiredEnvVariable('GIT_REPO')
            }
        );
    }

    getStorefrontBaseUrl() {
        return this.urlHelper.getStorefrontBaseUrl();
    }

    getStorefrontApiBaseUrl() {
        return this.urlHelper.getStorefrontApiBaseUrl();
    }

    getBackofficeBaseUrl() {
        return this.urlHelper.getBackofficeBaseUrl();
    }

    getBackendApiUrl() {
        return this.urlHelper.getBackendApiBaseUrl();
    }

    getBackofficeApiBaseUrl() {
        return this.urlHelper.getBackofficeApiBaseUrl();
    }

    _getRequiredEnvVariable(variableName) {
        if (!eval(`__ENV.${variableName}`)) {
            throw new Error(`${variableName} env variable must be specified.`);
        }

        return eval(`__ENV.${variableName}`);
    }
}
