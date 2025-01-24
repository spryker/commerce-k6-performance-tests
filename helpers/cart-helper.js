import {getThread} from "../lib/utils.js";

export class CartHelper {
    constructor(urlHelper, http, customerHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
        this.assertionsHelper = assertionsHelper;
    }

    haveCartWithProducts(quantity = 1, sku = '100429') {
        const defaultCartName = 'k6_testing_cart';
        const params = this.getParamsWithAuthorization();
        const carts = this.getCarts(params);

        const cartsResponse = this.http.sendPostRequest(
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
        );
        this.assertionsHelper.assertResponseStatus(cartsResponse, 201, 'Create cart');

        const cartsResponseJson = JSON.parse(cartsResponse.body);

        this.assertionsHelper.assertSingleResourceResponseBodyStructure(cartsResponseJson, 'Create cart');

        if (quantity > 0) {
            this.addItemToCart(cartsResponseJson.data.id, quantity, params, sku);
        }

        this.deleteCarts(carts, params);

        return cartsResponseJson.data.id;
    }

    getParamsWithAuthorization() {
        const defaultParams = {
            headers: {
                'Accept': 'application/json'
            },
            responseType: 'text'
        };
        const urlAccessTokens = `${this.urlHelper.getStorefrontApiBaseUrl()}/access-tokens`;

        const customerAuth = this.customerHelper.getCustomerByVuId(getThread())
        const response = this.http.sendPostRequest(
            this.http.url`${urlAccessTokens}`,
            JSON.stringify({
                data: {
                    type: 'access-tokens',
                    attributes: {
                        username: customerAuth.email,
                        password: customerAuth.pass
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

    getCartsUrl() {
        return `${this.urlHelper.getStorefrontApiBaseUrl()}/carts`;
    }

    getCarts(params) {
        const getCartsResponse = this.http.sendGetRequest(this.http.url`${this.getCartsUrl()}`, params, false);

        this.assertionsHelper.assertResponseStatus(getCartsResponse, 200, 'Get Carts');

        const getCartsResponseJson = JSON.parse(getCartsResponse.body);
        this.assertionsHelper.assertResourceCollectionResponseBodyStructure(getCartsResponseJson, 'Get Carts');

        return getCartsResponseJson;
    }

    deleteCarts(carts, params) {
        if (carts.data) {
            const self = this;
            carts.data.forEach(function (cart) {
                let deleteCartResponse = self.http.sendDeleteRequest(self.http.url`${self.getCartsUrl()}/${cart.id}`, null, params, false);
                self.assertionsHelper.assertResponseStatus(deleteCartResponse, 204, `Delete cart id: ${cart.id} Status: (${deleteCartResponse.status})`);
            });
        }
    }

    addItemToCart(cartId, quantity, params, sku, merchantReference) {
        const addItemToCartResponse = this.http.sendPostRequest(
            this.http.url`${this.getCartsUrl()}/${cartId}/items`,
            JSON.stringify({
                data: {
                    type: 'items',
                    attributes: {
                        sku: sku,
                        quantity: quantity,
                        merchantReference: merchantReference
                    }
                }
            }),
            params,
            false
        );

        this.assertionsHelper.assertResponseStatus(addItemToCartResponse, 201, 'Add Item to Cart');

        return addItemToCartResponse;
    }
}
