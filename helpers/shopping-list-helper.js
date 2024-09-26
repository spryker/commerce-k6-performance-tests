export class ShoppingListHelper {
    constructor(urlHelper, http, sapiHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.sapiHelper = sapiHelper;
        this.assertionsHelper = assertionsHelper;
    }

    haveShoppingList() {
        const paramsWithAuthorization = this.sapiHelper.getParamsWithAuthorization();
        const shoppingLists = this.getShoppingLists(paramsWithAuthorization);
        if (shoppingLists.data) {
            this.deleteShoppingLists(shoppingLists, paramsWithAuthorization);
        }
        this.createShoppingList(paramsWithAuthorization);
    }

    haveShoppingListWithProducts(products = {}) {
        // open quick order page
        const quickOrderPageResponse = this.http.sendGetRequest(this.http.url`${this.urlHelper.getStorefrontBaseUrl()}/en/quick-order`);
        this.assertionsHelper.assertResponseStatus(quickOrderPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(quickOrderPageResponse, '<h1 class="page-info__title title title--h3 ">Quick Order</h1>');

        const idShippingList = quickOrderPageResponse.html().find('select[name="idShoppingList"] > option:nth-child(1)').val();
        let formFields = {
            'idShoppingList': idShippingList,
        };

        products.forEach((product, index) => {
            formFields[`quick_order_form[items][${index}][sku]`] = product.sku;
            formFields[`quick_order_form[items][${index}][quantity]`] = product.quantity;
            formFields[`quick_order_form[items][${index}][product_offer_reference]`] = product.productOfferReference ? product.productOfferReference : '';
        });

        // add articles form submit  idShoppingList
        const addToShoppingListResponse = this.http.submitForm(quickOrderPageResponse, {
            formSelector: 'form[name="quick_order_form"]',
            submitSelector: 'button[name="addToShoppingList"]',
            fields: formFields,
        });

        this.assertionsHelper.assertResponseStatus(addToShoppingListResponse, 302);

        return idShippingList;
    }

    getShoppingLists(params) {
        const getShoppingListsResponse = this.http.sendGetRequest(this.http.url`${this._getShoppingListsEndpoint()}`, params, false);
        this.assertionsHelper.assertResponseStatus(getShoppingListsResponse, 200, 'Get Shopping Lists');

        const getShoppingListsResponseJson = JSON.parse(getShoppingListsResponse.body);
        this.assertionsHelper.assertResourceCollectionResponseBodyStructure(getShoppingListsResponseJson, 'Get Shopping Lists');

        return getShoppingListsResponseJson;
    }

    createShoppingList(params) {
        const postShoppingListsResponse = this.http.sendPostRequest(
            this.http.url`${this._getShoppingListsEndpoint()}`,
            JSON.stringify({
                data: {
                    type: 'shopping-lists',
                    attributes: {
                        name: 'K6 Shopping List',
                    }
                }
            }),
            params,
            false
        );
        this.assertionsHelper.assertResponseStatus(postShoppingListsResponse, 201, 'Create Shopping List');

        const postShoppingListsResponseJson = JSON.parse(postShoppingListsResponse.body);
        this.assertionsHelper.assertSingleResourceResponseBodyStructure(postShoppingListsResponseJson, 'Create Shopping List');
    }

    deleteShoppingLists(shoppingLists, params) {
        const self = this;
        shoppingLists.data.forEach(function (shoppingList) {
            let deleteShoppingListsResponse = self.http.sendDeleteRequest(self.http.url`${self._getShoppingListsEndpoint()}/${shoppingList.id}`, null, params, false);
            self.assertionsHelper.assertResponseStatus(deleteShoppingListsResponse, 204, 'Delete Shopping List');
        });
    }

    _getShoppingListsEndpoint() {
        return `${this.urlHelper.getStorefrontApiBaseUrl()}/shopping-lists`;
    }
}