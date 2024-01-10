import { SharedCartScenario } from "../../../../cross-product/sapi/scenarios/cart/shared-cart-scenario.js";

export class CartScenario extends SharedCartScenario {
    _setUp(requestParams) {
        let self = this;

        const cart = this.cartHelper.getCarts(requestParams).data[0];
        const cartResponse = this.http.sendGetRequest(
            this.http.url`${this.cartHelper.getCartsUrl()}/${cart.id}/?include=items`, requestParams, false
        );
        this.assertionsHelper.assertResponseStatus(cartResponse, 200);

        const cartResponseJson = JSON.parse(cartResponse.body);
        this.assertionsHelper.assertSingleResourceResponseBodyStructure(cartResponseJson);

        const cartRelationships = cartResponseJson.data.relationships;
        if (cartRelationships) {
            const items = JSON.parse(cartResponse.body).data.relationships.items;
            items.data.forEach(function (item) {
                let cartItemDeleteResponse = self.http.sendDeleteRequest(self.http.url`${self.cartHelper.getCartsUrl()}/${cart.id}/items/${item.id}`, null, requestParams, false);
                self.assertionsHelper.assertResponseStatus(cartItemDeleteResponse, 204);
            });
        }
        this.cartHelper.addItemToCart(cart.id, __ENV.numberOfItems, requestParams, '009_30692991');

        return cart.id;
    }
}
