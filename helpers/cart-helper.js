export class CartHelper {
    constructor(urlHelper, http) {
        this.urlHelper = urlHelper;
        this.http = http;
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
        const accessTokensResponse = JSON.parse(this.http.sendPostRequest(
            this.http.url`${urlAccessTokens}`,
            JSON.stringify({
                data: {
                    type: 'access-tokens',
                    attributes: {
                        username: 'sonia@spryker.com',
                        password: 'change123'
                    }
                }
            }),
            defaultParams,
            false
        ).body);
        defaultParams.headers.Authorization = `${accessTokensResponse.data.attributes.tokenType} ${accessTokensResponse.data.attributes.accessToken}`;

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
