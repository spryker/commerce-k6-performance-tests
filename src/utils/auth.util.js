import http from 'k6/http';
import { check } from 'k6';
import UrlUtil from './url.util.js';

export default class AuthUtil {

    constructor() {
        if (AuthUtil.instance) {
            return AuthUtil.instance;
        }

        // Token cache: { '<email>:<password>': 'Bearer <token>' }
        this.tokenCache = {};

        AuthUtil.instance = this;
    }

    static getInstance() {
        if (!AuthUtil.instance) {
            AuthUtil.instance = new AuthUtil();
        }

        return AuthUtil.instance;
    }

    getBearerToken(email, password = 'change123') {
        const cacheKey = `${email}:${password}`;

        if (this.tokenCache[cacheKey]) {
            return this.tokenCache[cacheKey];
        }

        const response = http.post(
            `${UrlUtil.getStorefrontApiUrl()}/access-tokens`,
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

        check(response, {
            'is status 201': () => response.status === 201,
        })

        const responseJson = JSON.parse(response.body);

        const token = `${responseJson.data.attributes.tokenType} ${responseJson.data.attributes.accessToken}`;
        this.tokenCache[cacheKey] = token;

        return token;
    }
}