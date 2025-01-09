import {check} from 'k6';

export class CartHelper {
    constructor(urlHelper, http, customerHelper, assertionsHelper, authTokenManager) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.customerHelper = customerHelper;
        this.assertionsHelper = assertionsHelper;
        this.authTokenManager = authTokenManager;
    }

    create(customerEmail, cartName, isDefault = false) {
        const requestParams = this.getParamsWithAuthorization(customerEmail);

        return this.http.sendPostRequest(
            this.http.url`${this.urlHelper.getStorefrontApiBaseUrl()}/carts`,
            JSON.stringify({
                data: {
                    type: 'carts',
                    attributes: {
                        name: cartName,
                        priceMode: 'GROSS_MODE',
                        currency: 'EUR',
                        store: 'DE',
                        isDefault: isDefault,
                    },
                },
            }),
            requestParams,
            false
        );
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

    getParamsWithAuthorization(email = this.customerHelper.getDefaultCustomerEmail(), password = this.customerHelper.getDefaultCustomerPassword()) {
        const defaultParams = {
            headers: {
                'Accept': 'application/json'
            },
        };

        defaultParams.headers.Authorization = this.authTokenManager.getAuthToken(email, password);

        return defaultParams;
    }

    getCartsUrl() {
        return `${this.urlHelper.getStorefrontApiBaseUrl()}/carts`;
    }

    getCarts(email) {
        const params = this.getParamsWithAuthorization(email);
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
                self.assertionsHelper.assertResponseStatus(deleteCartResponse, 204, 'Delete cart');
            });
        }
    }

    deleteCart(customerEmail, cartId, thresholdTag = null) {
        const requestParams = this.getParamsWithAuthorization(customerEmail);
        if (thresholdTag) {
            requestParams.tags = { name: thresholdTag };
        }

        const response = this.http.sendDeleteRequest(this.http.url`${this.getCartsUrl()}/${cartId}`, null, requestParams, false);

        check(response, {
            'Cart deleted successfully': (response) => response.status === 204
        });
    }

    addItemToCart(cartId, quantity, params, sku) {
        const addItemToCartResponse = this.http.sendPostRequest(
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

        this.assertionsHelper.assertResponseStatus(addItemToCartResponse, 201, 'Add Item to Cart');

        return addItemToCartResponse;
    }
}
