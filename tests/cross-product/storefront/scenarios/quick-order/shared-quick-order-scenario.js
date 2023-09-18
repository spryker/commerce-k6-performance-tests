import { AbstractScenario } from '../../../../abstract-scenario.js';
import { check } from 'k6';

export class SharedQuickOrderScenario extends AbstractScenario {
    async execute(productSku, quantity) {
        const context = await this.browserHelper.getLoggedInUserContext();
        const page = context.newPage();

        try {
            await this.openQuickOrderPage(page);
            await this.searchForProduct(page, productSku);
            await this.inputProductQuantity(page, quantity);
            await this.createOrder(page);
        } finally {
            page.close();
        }
    }

    async openQuickOrderPage(page) {
        await page.goto(`${this.getStorefrontBaseUrl()}/en/quick-order`);
        check(page, {
            ['Quick order page is opened']: (page) => page.locator('form[name=quick_order_form]').isVisible()
        });
        check(page, {
            ['Create order button is visible']: (page) => page.locator('button[name=createOrder]').isVisible()
        });
    }

    async searchForProduct(page, productSku) {
        const productSearchInputSelector = 'quick-order-row:nth-child(2)  .product-search-autocomplete-form__input';
        const productSearchItemSelector = 'quick-order-row:nth-child(2) .js-product-search-autocomplete-form__suggestions-ajax-provider0 ul li';
        const quantityInputSelector = 'quick-order-row:nth-child(2) .quick-order-row-partial__quantity';

        const productSearchInput = page.locator(productSearchInputSelector);

        await Promise.all([productSearchInput.type(productSku), page.waitForSelector(productSearchItemSelector)]);
        await productSearchInput.press('Enter');

        check(page, {
            [`Product quantity is editable`]: (page) => page.locator(quantityInputSelector).isEditable()
        });
    }

    async inputProductQuantity(page, quantity) {
        const quantityInputSelector = 'quick-order-row:nth-child(2) .quick-order-row-partial__quantity';
        const quantityInput = page.locator(quantityInputSelector);

        await quantityInput.type(quantity);

        check(quantityInput, {
            [`Product quantity is ${quantity}`]: (quantityInput) => quantityInput.inputValue() === quantity.toString()
        });
    }

    async createOrder(page) {
        const submitButton = page.locator('button[name=createOrder]');

        await Promise.all([submitButton.click(), page.waitForNavigation()]);

        check(page, {
            ['Checkout form is visible']: (page) => page.locator('form[name=addressesForm]').isVisible()
        });
    }
}
