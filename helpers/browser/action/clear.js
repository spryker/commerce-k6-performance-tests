import Default from './default.js'

export default class Clear extends Default {
    constructor(locator, options) {
        super('clear', locator, '', options)
    }
    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, { state: 'visible' });
            let element = await browser.getElement(this.locator)
            await element.focus();
            await element.clear()

            await browser.waitUntilLoad('networkidle');

            return String(await element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error filling ${this.locator}:`, e);
        }
    }
}