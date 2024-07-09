import Default from './default.js'

export default class Type extends Default {
    constructor(locator, options) {
        super('type', locator, '', options)
    }

    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, { state: 'visible' });
            let element = await browser.getElement(this.locator)
            await element.focus();
            await element.type(this.value);
            await browser.waitUntilLoad('networkidle');

            return String(await element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error typing ${this.locator}:`, e);
        }
        return false;
    }
}