export class BapiHelper {
    constructor(urlHelper, http, adminHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.adminHelper = adminHelper;
        this.assertionsHelper = assertionsHelper;
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

        const responseJson = JSON.parse(response.body);
        
        defaultParams.headers.Authorization = `${responseJson.token_type} ${responseJson.access_token}`;

        return defaultParams;
    }

}
