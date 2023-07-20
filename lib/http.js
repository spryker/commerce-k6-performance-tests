import http from 'k6/http';
import encoding from 'k6/encoding';
import { fail } from "k6";

export class Http {
    constructor(environment) {
        this.authorizationHeader = this._getAuthorizationHeader(environment);
    }

    sendGetRequest(url, params = {}, withBasicAuthorization = true) {
        params = this._addAuthorizationHeader(params, withBasicAuthorization);

        return http.get(url, params);
    }

    submitForm(response, formData)
    {
        if (!formData.params) {
            formData.params = {};
        }

        formData.params = this._addAuthorizationHeader(formData.params);
        formData.params.redirects = 0;

        return response.submitForm(formData);
    }

    sendPostRequest(url, body, params = {}, withBasicAuthorization = true) {
        params = this._addAuthorizationHeader(params, withBasicAuthorization);

        return http.post(url, body, params);
    }

    sendDeleteRequest(url, body, params = {}, withBasicAuthorization = true) {
        params = this._addAuthorizationHeader(params, withBasicAuthorization);

        return http.del(url, body, params);
    }

    _getAuthorizationHeader(environment) {
        if (!environment) {
            fail('Environment must be specified.');
        }

        const username = eval(`__ENV.${environment}_AUTH_USERNAME`);
        const password = eval(`__ENV.${environment}_AUTH_PASSWORD`);

        if (!username || !password) {
            return null;
        }

        return `Basic ${encoding.b64encode(`${username}:${password}`)}`;
    }

    _addAuthorizationHeader(params, withBasicAuthorization = true) {
        if (this.authorizationHeader && withBasicAuthorization) {
            if (!params.headers) {
                params.headers = {};
            }

            params.headers.Authorization = this.authorizationHeader;
        }

        return params;
    }

    url(parts, ...pieces) {
        if (pieces.length && pieces[0].startsWith('http')) {
            parts = [...parts];
            parts.shift();
            parts[0] = pieces[0] + parts[0];
            pieces.shift();
        }

        return http.url(parts, ...pieces);
    }
}
