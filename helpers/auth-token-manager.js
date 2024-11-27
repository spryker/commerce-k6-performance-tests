export class AuthTokenManager {
    constructor(http, urlHelper, assertionsHelper) {
        if (AuthTokenManager.instance) {
            return AuthTokenManager.instance;
        }

        if (!http || !urlHelper || !assertionsHelper) {
            throw new Error('Http, UrlHelper, and AssertionsHelper must be provided.');
        }

        this.http = http;
        this.urlHelper = urlHelper;
        this.assertionsHelper = assertionsHelper;

        // Token cache: { '<email>:<password>': 'Bearer <token>' }
        this.tokenCache = {};

        AuthTokenManager.instance = this;
    }

    static getInstance(http, urlHelper, assertionsHelper) {
        if (!AuthTokenManager.instance) {
            AuthTokenManager.instance = new AuthTokenManager(http, urlHelper, assertionsHelper);
        }
        return AuthTokenManager.instance;
    }

    getAuthToken(email, password) {
        const cacheKey = `${email}:${password}`;

        // Return cached token if exists
        if (this.tokenCache[cacheKey]) {
            return this.tokenCache[cacheKey];
        }

        // Fetch new token from the API
        const urlAccessTokens = `${this.urlHelper.getStorefrontApiBaseUrl()}/access-tokens`;
        const response = this.http.sendPostRequest(
            this.http.url`${urlAccessTokens}`,
            JSON.stringify({
                data: {
                    type: 'access-tokens',
                    attributes: {
                        username: email,
                        password: password,
                    },
                },
            }),
            { headers: { Accept: 'application/json' } },
            false
        );

        this.assertionsHelper.assertResponseStatus(response, 201, 'Auth Token');

        const responseJson = JSON.parse(response.body);
        this.assertionsHelper.assertSingleResourceResponseBodyStructure(responseJson, 'Auth Token');

        const token = `${responseJson.data.attributes.tokenType} ${responseJson.data.attributes.accessToken}`;
        this.tokenCache[cacheKey] = token;

        return token;
    }
}
