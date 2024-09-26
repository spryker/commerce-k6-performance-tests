import {AbstractScenario} from '../../../../abstract-scenario.js';
import {group} from 'k6';

export class SharedViewShoppingListScenario extends AbstractScenario {
    execute() {
        let self = this;

        self.shoppingListHelper.haveShoppingList();
        this.storefrontHelper.loginUser();
        const idShoppingList = self.shoppingListHelper.haveShoppingListWithProducts(self._getProducts());

        group('View Shopping List', function () {
            self.shoppingListsPage();
            const shoppingListDetailsPageResponse = self.shoppingListDetailsPage(idShoppingList);
            self.addShoppingListProductsToCart(shoppingListDetailsPageResponse);
        });
    }

    shoppingListsPage() {
        const shoppingListsPageResponse = this.http.sendGetRequest(this.getStorefrontBaseUrl() + '/en/shopping-list');

        this.assertionsHelper.assertResponseStatus(shoppingListsPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(shoppingListsPageResponse, '<h3>Shopping lists</h3>');
    }

    shoppingListDetailsPage(idShoppingList) {
        const shoppingListDetailsPageResponse = this.http.sendGetRequest(this.getStorefrontBaseUrl() + `/en/shopping-list/details/${idShoppingList}`);

        this.assertionsHelper.assertResponseStatus(shoppingListDetailsPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(shoppingListDetailsPageResponse, 'Add all available products to cart');

        return shoppingListDetailsPageResponse;
    }

    addShoppingListProductsToCart(shoppingListDetailsPageResponse) {
        const addToCartResponse = this.http.submitForm(shoppingListDetailsPageResponse, {
            formSelector: 'form[name="shopping_list_add_item_to_cart_form"]',
            submitSelector: 'button[name="add-all-available"]',
        });

        this.assertionsHelper.assertResponseStatus(addToCartResponse, 302);
    }

    _getProducts() {
        const productSkus = this.productHelper.getNeverOutStockProductSkus(10);

        return productSkus.map(sku => {
            return {
                'sku': sku,
                'quantity': 1,
            };
        });
    }
}