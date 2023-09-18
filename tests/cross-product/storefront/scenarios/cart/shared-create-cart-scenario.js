import { AbstractScenario } from '../../../../abstract-scenario.js';
import { check } from 'k6';

export class SharedCreateCartScenario extends AbstractScenario {
    async execute() {
        const context = await this.browserHelper.getLoggedInUserContext();
        const page = context.newPage();

        try {
            await page.goto(`${this.getStorefrontBaseUrl()}/en/multi-cart/create`);
            check(page, {
                'Create cart form is visible': (page) => page.locator('form[name=quoteForm]').isVisible()
            });

            const cartName = 'K6 Test cart ' + new Date().getTime();
            await page.locator('#quoteForm_name').type(cartName);
            await Promise.all([
                page.locator('form[name=quoteForm] button[type=submit]').click(),
                page.waitForNavigation(),
            ]);

            check(page, {
                'Success flash message is shown': (page) => page.locator('.flash-message--success').isVisible()
            });
            check(page, {
                'Flash message has correct text': (page) => page.locator('.flash-message__message .flash-message__text').innerText().trim() === `Cart '${cartName}' was created successfully`
            });
        } finally {
            page.close();
        }
    }
}
