import {AbstractScenario} from '../../../../abstract-scenario.js';

export class SharedCrudShoppingList extends AbstractScenario {
    constructor(environment, options = {}) {
        super(environment, options);

        this._shoppingListName = 'K6 CRUD Shopping List' + new Date().getTime();
    }

    async execute() {
        const context = await this.browserHelper.getLoggedInUserContext();
        const page = context.newPage();
        try {
            await this.openShoppingListPage(page);
            await this.createShoppingList(page);
            await this.openShoppingListDetailPage(page);
            await this.searchForProduct(page);
            await this.selectProduct(page);
            await this.inputProductQuantity(page);
            await this.addProductToShoppingList(page);
            await this.addShoppingListItemToCart(page);
        } finally {
            page.close();
        }
    }

    async openShoppingListPage(page) {
        await page.goto(`${this.getStorefrontBaseUrl()}/en/shopping-list`);

        this.assertionsHelper.assertPageState(
            page,
            'Shopping List page is opened',
            (page) => page.locator('form[name="shopping_list_form"]').isVisible(),
        );
    }

    async createShoppingList(page) {
        const shoppingListNameInputSelector = 'form[name="shopping_list_form"] input[name="shopping_list_form[name]"]';
        const shoppingListSubmitButtonSelector = 'form[name="shopping_list_form"] button[data-qa="submit-button"]';

        const shoppingListNameInput = page.locator(shoppingListNameInputSelector);
        const submitButton = page.locator(shoppingListSubmitButtonSelector);

        await Promise.all([
            shoppingListNameInput.type(this._shoppingListName),
            submitButton.click(),
            page.waitForNavigation()
        ]);

        this.assertionsHelper.assertPageState(
            page,
            'Shopping List is created',
            (page) => page.locator(this._getShoppingListTableLastRowSelector()).textContent() === this._shoppingListName,
        );
    }

    async openShoppingListDetailPage(page) {
        await Promise.all([
            page.locator(this._getShoppingListTableLastRowSelector()).click(),
            page.waitForNavigation()
        ]);

        this.assertionsHelper.assertPageState(
            page,
            'Shopping List Detail page is opened',
            (page) => page.locator('h1').textContent() === this._shoppingListName,
        );
    }

    async searchForProduct(page) {
        const productSearchInputSelector = 'form.js-product-quick-add-form__form input.product-search-autocomplete-form__input';
        const productSearchItemSelector = 'form.js-product-quick-add-form__form ul.products-list li.products-list__item--selected';
        const productSearchInput = page.locator(productSearchInputSelector);

        await Promise.all([
            productSearchInput.type(__ENV.productSku),
            page.waitForSelector(productSearchItemSelector)]
        );

        this.assertionsHelper.assertPageState(
            page,
            'Product is found',
            (page) => page.locator(productSearchItemSelector).isVisible(),
        );
    }

    async selectProduct(page) {
        const productSearchItemSelector = 'form.js-product-quick-add-form__form ul.products-list li.products-list__item--selected';

        page.locator(productSearchItemSelector).click();

        this.assertionsHelper.assertPageState(
            page,
            'Product is selected',
            (page) => page.locator('input[name="sku"]').value() === __ENV.productSku,
        );
    }

    async inputProductQuantity(page) {
        const quantityInputSelector = 'form.js-product-quick-add-form__form input[data-qa="product-quick-add-form-quantity-input"]';

        const quantity = __ENV.quantity;
        const quantityInput = page.locator(quantityInputSelector);

        await quantityInput.type(quantity);

        this.assertionsHelper.assertPageState(
            page,
            `Product quantity is ${quantity}`,
            (page) => page.locator(quantityInput).inputValue() === quantity,
        );
    }

    async addProductToShoppingList(page) {
        const submitButtonSelector = 'form.js-product-quick-add-form__form button.product-quick-add-form__button';
        const submitButton = page.locator(submitButtonSelector);

        await Promise.all([
            submitButton.click(),
            page.waitForNavigation()
        ]);

        this.assertionsHelper.assertPageState(
            page,
            'Product is added to Shopping List',
            (page) => page.locator(this._getShoppingListAddItemButtonSelector).isVisible(),
        );
    }

    async addShoppingListItemToCart(page) {
        const addToCartButton = page.locator(this._getShoppingListAddItemButtonSelector);

        await Promise.all([
            addToCartButton.click(),
            page.waitForNavigation()
        ]);

        this.assertionsHelper.assertPageState(
            page,
            'Success flash message is shown',
            (page) => page.locator('.flash-message--success').isVisible(),
        );
        this.assertionsHelper.assertPageState(
            page,
            'Flash message has the correct text',
            (page) => page.locator('.flash-message__message .flash-message__text').innerText().trim() === `Item added to cart successfully.`,
        );
    }

    _getShoppingListTableLastRowSelector() {
        return 'div.shopping-list-overview-table > table > tbody > tr:last-child > td > a';
    }

    _getShoppingListAddItemButtonSelector() {
        return 'div.shopping-list-table > article:last-child button[name="add-item"]';
    }
}