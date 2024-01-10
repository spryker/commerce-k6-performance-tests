import { Http } from '../lib/http.js';
import { loadEnvironmentConfig } from '../lib/utils.js';
import { CartHelper } from '../helpers/cart-helper.js';
import { StorefrontHelper } from '../helpers/storefront-helper.js';
import { BrowserHelper } from '../helpers/browser-helper.js';
import { UrlHelper } from '../helpers/url-helper.js';
import { Trend } from 'k6/metrics';
import { fail, check } from 'k6';
import CustomerHelper from "../helpers/customer-helper.js";
import { ResponseValidatorHelper } from "../helpers/response-validator-helper.js";

export class AbstractScenario {
    constructor(environment, options = {}) {
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
        this.customerHelper = new CustomerHelper();
        this.responseValidatorHelper = new ResponseValidatorHelper();
        this.cartHelper = new CartHelper(this.urlHelper, this.http, this.customerHelper, this.responseValidatorHelper);
        this.storefrontHelper = new StorefrontHelper(this.urlHelper, this.http, this.customerHelper, this.responseValidatorHelper);
        this.browserHelper = new BrowserHelper(this.urlHelper, this.customerHelper);
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

    assertRequestDurationIsLowerOrEqualTo(response, max) {
        const duration = response.timings.duration;
        const assertionName = `Response duration ${duration} is lower or equal to ${max}ms`;

        return check(response, {
            [assertionName]: () => duration <= max
        });
    }

    assertResponseBodyIncludes(response, text) {
        return check(response, {
            [`Body includes text: ${text}`]: (r) => r.body && r.body.includes(text),
        })
    }

    assertResponseStatus(response, expectedStatus = 200) {
        return check(response, {
            [`Response status is ${expectedStatus}`]: r => r.status === expectedStatus
        });
    }

    assertPageState(page, assertionDescription, assertion) {
        if (
            !check(page, {
                [assertionDescription]: (page) => assertion(page),
            })
        ) {
            fail(`Page state assertion "${assertionDescription}" failed.`);
        }
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
