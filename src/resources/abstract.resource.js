import { check } from 'k6';
import http from 'k6/http';
import EnvironmentUtil from '../utils/environment.util.js';

export default class AbstractResource {

    constructor(bearerToken = null) {
        this.bearerToken = bearerToken;
        this.headers = {
            'Accept': 'application/json',
            ...(this.bearerToken && { 'Authorization': this.bearerToken })
        };
    }

    postRequest(resourceUrl, payload) {
        const fullUrl = `${EnvironmentUtil.getStorefrontApiUrl()}/${resourceUrl}`;
        const response = http.post(fullUrl, JSON.stringify(payload), { headers: this.headers });

        check(response, { [`Request to ${fullUrl} successful.`]: (r) => r.status === 201 });

        return response;
    }
}
