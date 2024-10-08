export class CartHelper {
    constructor(urlHelper, http, sapiHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.sapiHelper = sapiHelper;
        this.assertionsHelper = assertionsHelper;
        this.params = null;
    }

    haveCart() {
        const defaultCartName = 'k6_testing_cart';
        const params = this._getParamsWithAuthorization();
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

        this.deleteCarts(carts, params);

        return cartsResponseJson.data.id;
    }

    haveCartWithProducts(quantity = 1, sku = '100429') {
        const idCart = this.haveCart();

        if (quantity > 0) {
            const params = this._getParamsWithAuthorization();
            this.addItemToCart(idCart, quantity, params, sku);
        }

        return idCart;
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
                self.assertionsHelper.assertResponseStatus(deleteCartResponse, 204, 'Delete cart');
            });
        }
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

    _getParamsWithAuthorization() {
        if (this.params === null) {
            this.params = this.sapiHelper.getParamsWithAuthorization();
        }

        return this.params;
    }
}
