import Default from './default.js'

export default class Fill extends Default {
    constructor(locator, value, options) {
        super('fill', locator, value, options)
    }
    async act(browser) {
        try {
            browser.page.waitForSelector(this.locator, { state: 'visible' });
            // this.page.waitForSelector(locator, {state: 'attached'});
            let element = browser.getElement(this.locator)
            element.focus();
            element.fill(this.value);
            await browser.waitUntilLoad('networkidle');

            return String(element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error filling ${this.locator}:`, e);
        }
    }
}