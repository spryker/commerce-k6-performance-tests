import { Counter } from 'k6/metrics';
import {debug} from '../lib/utils.js';

export class BapiHelper {
    constructor(urlHelper, http, adminHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.adminHelper = adminHelper;
        this.assertionsHelper = assertionsHelper;
        this.tokenCreationTotal = new Counter('token_creation_total', true)
        this.tokenCreationRequestsTotal = new Counter('token_generation_requests', false)
        this.defaultParams = null
        this.refreshAt = new Date()
    }

    requireRefresh() {
        return this.defaultParams === null || this.refreshAt.getDate() <= new Date().getDate()
    }

    getParamsWithAuthorization() {
        if (!this.requireRefresh()) {
            return this.defaultParams
        }

        this.defaultParams = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Store': __ENV.STORE ? __ENV.STORE : 'DE'
            },
        };

        const urlAccessTokens = `${this.urlHelper.getBackendApiBaseUrl()}/token`;

        const response = this.http.sendPostRequest(
            this.http.url`${urlAccessTokens}`,
            JSON.stringify({
                grantType: 'password',
                username: this.adminHelper.getDefaultAdminEmail(),
                password: this.adminHelper.getDefaultAdminPassword()
            }),
            this.defaultParams,
            false
        );

        debug('response', response)

        this.assertionsHelper.assertResponseStatus(response, 200, 'Auth Token');
        
        this.tokenCreationTotal.add(response.timings.duration)

        const responseJson = JSON.parse(response.body);
        
        this.refreshAt.setDate(this.refreshAt.getDate + responseJson.expires_in)
        
        this.defaultParams.headers.Authorization = `${responseJson.token_type} ${responseJson.access_token}`;
        
        this.tokenCreationRequestsTotal.add(1)

        return this.defaultParams;
    }
}
