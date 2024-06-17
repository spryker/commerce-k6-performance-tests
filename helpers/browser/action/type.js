import Default from './default.js'

export default class Type extends Default {
    constructor(locator, options) {
        super('type', locator, '', options)
    }

    async act(browser) {
        try {
            browser.page.waitForSelector(this.locator, { state: 'visible' });
            let element = browser.getElement(this.locator)
            element.focus();
            element.type(this.value);
            await browser.waitUntilLoad('networkidle');
            return String(element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error typing ${this.locator}:`, e);
        }
        return false;
    }
}