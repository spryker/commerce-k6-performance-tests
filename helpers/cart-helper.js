export class CartHelper {
    constructor(urlHelper, http, sapiHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.sapiHelper = sapiHelper;
        this.assertionsHelper = assertionsHelper;
    }

    haveCartWithProducts(quantity = 1, sku = '100429') {
        const defaultCartName = 'k6_testing_cart';
        const params = this.sapiHelper.getParamsWithAuthorization();
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
}
