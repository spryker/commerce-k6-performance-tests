import Default from './default.js'

export default class ResetForm extends Default {
    constructor(locator, options) {
        super('resetForm', locator, '', options)
    }

    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, {state: 'attached'});

            let result = await browser.page.evaluate((locator) => {
                return document.querySelector(locator).reset()
            }, this.locator);

            console.log('ResetForm:', result)

            return true;
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            await browser.screen();
        }

        return false;
    }
}