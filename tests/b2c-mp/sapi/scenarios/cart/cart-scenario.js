import { SharedCartScenario } from "../../../../cross-product/storefront/scenarios/cart/shared-cart-scenario.js";

export class CartScenario extends SharedCartScenario {
    _setUp(requestParams) {
        let self = this;

        const cart = this.cartHelper.getCarts(requestParams).data[0];
        const cartResponse = this.http.sendGetRequest(
            this.http.url`${this.cartHelper.getCartsUrl()}/${cart.id}/?include=items`, requestParams, false
        );
        const cartRelationships = JSON.parse(cartResponse.body).data.relationships;
        if (cartRelationships) {
            const items = JSON.parse(cartResponse.body).data.relationships.items;
            items.data.forEach(function (item) {
                self.http.sendDeleteRequest(self.http.url`${self.cartHelper.getCartsUrl()}/${cart.id}/items/${item.id}`, null, requestParams, false);
            });
        }
        this.cartHelper.addItemToCart(cart.id, __ENV.numberOfItems, requestParams, '009_30692991');

        return cart.id;
    }
}
