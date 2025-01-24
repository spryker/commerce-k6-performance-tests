import Default from './default.js'

export default class ValidateTextExists extends Default {
    constructor(locator, value, options) {
        super('textExists', locator, value, options)
    }

    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, {state: 'attached'});

            let text = await browser.page.evaluate((locator) => {
                return document.querySelector(locator).innerText
            }, this.locator);

            return text.includes(this.value);
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            await browser.screen();
        }

        return false;
    }
}