import http from 'k6/http';
import { check } from 'k6';
import EnvironmentUtil from './environment.util.js';

export default class AuthUtil {
    static instance;

    constructor() {
        if (AuthUtil.instance) {
            return AuthUtil.instance;
        }

        // Token cache: { '<email>:<password>': 'Bearer <token>' }
        this.tokenCache = {};

        AuthUtil.instance = this;
    }

    /**
     * @returns {AuthUtil}
     */
    static getInstance() {
        if (!AuthUtil.instance) {
            AuthUtil.instance = new AuthUtil();
        }

        return AuthUtil.instance;
    }

    getBearerToken(email, password = 'change123', force = false) {
        const cacheKey = `${email}:${password}`;

        if (!force && this.tokenCache[cacheKey]) {
            return this.tokenCache[cacheKey];
        }

        const response = http.post(
            `${EnvironmentUtil.getStorefrontApiUrl()}/access-tokens`,
            JSON.stringify({
                data: {
                    type: 'access-tokens',
                    attributes: {
                        username: email,
                        password: password,
                    },
                },
            }),
            {
                headers: {
                    Accept: 'application/json'
                }
            }
        );

        check(response, {'Token generated successfully.': (r) => r.status === 201});

        const responseJson = JSON.parse(response.body);

        const token = `${responseJson.data.attributes.tokenType} ${responseJson.data.attributes.accessToken}`;
        this.tokenCache[cacheKey] = token;

        return token;
    }
}
