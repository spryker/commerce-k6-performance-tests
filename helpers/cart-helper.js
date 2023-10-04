import { check,fail } from 'k6';

export class CartHelper {
    constructor(urlHelper, http, customerHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
    }

    haveCartWithProducts(quantity = 1, sku = '100429') {
        const defaultCartName = 'k6_testing_cart';
        const params = this.getParamsWithAuthorization();
        const carts = this.getCarts(params);

        const cartsResponse = JSON.parse(this.http.sendPostRequest(
            this.http.url`${this.urlHelper.getStorefrontApiBaseUrl()}/carts`,
            JSON.stringify({
                data: {
                    type: 'carts',
                    attributes: {
                        name: defaultCartName,
                        priceMode: 'GROSS_MODE',
                        currency: 'EUR',
                        store: 'DE',
                        isDefault: true
                    }
                }
            }),
            params,
            false
        ).body);

        if (quantity > 0) {
            this.addItemToCart(cartsResponse.data.id, quantity, params, sku);
        }

        this.deleteCarts(carts, params);

        return cartsResponse.data.id;
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

        if (
            !check(response, {
                'Verify that Auth Token Request status is s 201': (response) => response.status === 201,
            })
        ) {
            fail('Getting access token response status was not 201 but ' + response.status);
        }

        const responseJson = JSON.parse(response.body);

        check(responseJson, {
            'Verify token response body has `data` defined': (responseJson) => responseJson.data !== undefined,
            'Verify token response body has `data.attributes` defined': (responseJson) => responseJson.data.attributes !== undefined
        });

        defaultParams.headers.Authorization = `${responseJson.data.attributes.tokenType} ${responseJson.data.attributes.accessToken}`;

        return defaultParams;
    }

    getCartsUrl() {
        return `${this.urlHelper.getStorefrontApiBaseUrl()}/carts`;
    }

    getCarts(params) {
        return JSON.parse(this.http.sendGetRequest(this.http.url`${this.getCartsUrl()}`, params, false).body);
    }

    deleteCarts(carts, params) {
        if (carts.data) {
            const self = this;
            carts.data.forEach(function (cart) {
                self.http.sendDeleteRequest(self.http.url`${self.getCartsUrl()}/${cart.id}`, null, params, false);
            });
        }
    }

    addItemToCart(cartId, quantity, params, sku) {
        return this.http.sendPostRequest(
            this.http.url`${this.getCartsUrl()}/${cartId}/items`,
            JSON.stringify({
                data: {
                    type: 'items',
                    attributes: {
                        sku: sku,
                        quantity: quantity,
                        merchantReference: 'MER000008'
                    }
                }
            }),
            params,
            false
        );
    }
}
