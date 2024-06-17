import Default from './default.js'

export default class SelectOption extends Default {
    constructor(locator, value, options) {
        super('selectOption', locator, value, options)
    }

    async act(browser) {
        await browser.page.waitForSelector(this.locator, {state: 'attached'});
        try {
            let element = browser.getElement(this.locator);
            await element.selectOption(this.value);
            browser.screen()
            await browser.waitUntilLoad('networkidle');

            return this.locator.includes('attribute') ? true : String(element.inputValue()) === String(this.value);
        } catch (e) {
            console.error('Error selecting the option:', e);
        }

        return false;
    }
}