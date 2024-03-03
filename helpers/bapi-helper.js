import { Counter } from 'k6/metrics';

export class BapiHelper {
    constructor(urlHelper, http, adminHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.adminHelper = adminHelper;
        this.assertionsHelper = assertionsHelper;
        this.tokenCreationTotal = new Counter('token_creation_total', true)
    }

    getParamsWithAuthorization() {
        const defaultParams = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Store': 'DE'
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
            defaultParams,
            false
        );

        this.assertionsHelper.assertResponseStatus(response, 200, 'Auth Token');
        
        this.tokenCreationTotal.add(response.timings.duration)

        const responseJson = JSON.parse(response.body);
        
        defaultParams.headers.Authorization = `${responseJson.token_type} ${responseJson.access_token}`;

        return defaultParams;
    }

}
