export class SapiHelper {
    constructor(urlHelper, http, customerHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
        this.assertionsHelper = assertionsHelper;
    }

    getParamsWithAuthorization() {
        const defaultParams = {
            headers: {
                'Accept': 'application/json'
            },
        };
        const urlAccessTokens = `${this.urlHelper.getStorefrontApiBaseUrl()}/access-tokens`;

        const response = this.http.sendPostRequest(
            this.http.url`${urlAccessTokens}`,
            JSON.stringify({
                data: {
                    type: 'access-tokens',
                    attributes: {
                        username: this.customerHelper.getDefaultCustomerEmail(),
                        password: this.customerHelper.getDefaultCustomerPassword()
                    }
                }
            }),
            defaultParams,
            false
        );
        this.assertionsHelper.assertResponseStatus(response, 201, 'Auth Token');

        const responseJson = JSON.parse(response.body);
        this.assertionsHelper.assertSingleResourceResponseBodyStructure(responseJson, 'Auth Token');

        defaultParams.headers.Authorization = `${responseJson.data.attributes.tokenType} ${responseJson.data.attributes.accessToken}`;

        return defaultParams;
    }
}