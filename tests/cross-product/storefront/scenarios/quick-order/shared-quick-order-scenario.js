import { AbstractScenario } from '../../../../abstract-scenario.js';

export class SharedQuickOrderScenario extends AbstractScenario {
  async execute() {
    const context = await this.browserHelper.getLoggedInUserContext();
    const page = context.newPage();

    try {
      await this.openQuickOrderPage(page);
      await this.searchForProduct(page);
      await this.selectProduct(page);
      await this.inputProductQuantity(page);
      await this.createOrder(page);
    } finally {
      page.close();
    }
  }

  async openQuickOrderPage(page) {
    await page.goto(`${this.getStorefrontBaseUrl()}/en/quick-order`);
    this.assertionsHelper.assertPageState(page, 'Quick order page is opened', (page) =>
      page.locator('form[name=quick_order_form]').isVisible()
    );
    this.assertionsHelper.assertPageState(page, 'Create order button is visible', (page) =>
      page.locator('button[name=createOrder]').isVisible()
    );
  }

  async searchForProduct(page) {
    const productSearchInputSelector = 'quick-order-row:nth-child(2) .product-search-autocomplete-form__input';
    const productSearchItemSelector = 'quick-order-row:nth-child(2) li.products-list__item--selected';
    const productSearchInput = page.locator(productSearchInputSelector);

    await Promise.all([productSearchInput.type(__ENV.productSku), page.waitForSelector(productSearchItemSelector)]);

    this.assertionsHelper.assertPageState(page, 'Product is found', (page) =>
      page.locator('quick-order-row:nth-child(2) li.products-list__item--selected').isVisible()
    );
  }

  async selectProduct(page) {
    page.locator('quick-order-row:nth-child(2) li.products-list__item--selected').click();

    this.assertionsHelper.assertPageState(page, 'Product quantity field is editable', (page) =>
      page.locator(this._getQuantityInputSelector()).isEditable()
    );
  }

  async inputProductQuantity(page) {
    const quantity = __ENV.numberOfItems;
    const quantityInput = page.locator(this._getQuantityInputSelector());

    await quantityInput.type(quantity);

    this.assertionsHelper.assertPageState(
      page,
      `Product quantity is ${quantity}`,
      (page) => page.locator(this._getQuantityInputSelector()).inputValue() === quantity
    );
  }

  async createOrder(page) {
    const submitButton = page.locator('button[name=createOrder]');

    await Promise.all([submitButton.click(), page.waitForNavigation()]);

    this.assertionsHelper.assertPageState(page, 'Checkout form is visible', (page) =>
      page.locator('form[name=addressesForm]').isVisible()
    );
  }

  _getQuantityInputSelector() {
    return 'quick-order-row:nth-child(2) .quick-order-row-partial__quantity-input';
  }
}
