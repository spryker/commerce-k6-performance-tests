import { Http } from '../lib/http.js';
import { loadEnvironmentConfig } from '../lib/utils.js';
import { CartHelper } from '../helpers/cart-helper.js';
import { StorefrontHelper } from '../helpers/storefront-helper.js';
import { UrlHelper } from '../helpers/url-helper.js';
import { Trend } from 'k6/metrics';
import { fail, check } from "k6";

export class AbstractScenario {
    constructor(environment) {
        if (this.constructor === AbstractScenario) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        if (!environment) {
            throw new Error("Environment must be specified.");
        }

        this.environment = environment;

        this.http = new Http(this.environment);
        this.environmentConfig = loadEnvironmentConfig(this.environment);
        this.urlHelper = new UrlHelper(this.environmentConfig);
        this.cartHelper = new CartHelper(this.urlHelper, this.http);
        this.storefrontHelper = new StorefrontHelper(this.urlHelper, this.http);
    }

    createTrendMetric(name) {
        return new Trend(`${this.environment}.${name}`);
    }

    addResponseDurationToTrend(trend, response) {
        trend.add(response.timings.duration,
            {
                endpointUrl: response.url.toString(),
                gitHash: this._getRequiredEnvVariable('GIT_HASH'),
                gitBranch: this._getRequiredEnvVariable('GIT_BRANCH'),
                gitRepo: this._getRequiredEnvVariable('GIT_REPO')
            }
        );
    }

    assertResponseBodyIncludes(response, text) {
        if (
            !check(response, {
                [`Verify ${text} text`]: (r) => r.body.includes(text),
            })
        ) {
            fail();
        }
    }

    assertResponseStatus(response, expectedStatus = 200) {
        check(response, {
            [`Response status is ${expectedStatus}`]: r => r.status === expectedStatus
        });
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
