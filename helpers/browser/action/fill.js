import Default from './default.js'

export default class Fill extends Default {
    constructor(locator, value, options) {
        super('fill', locator, value, options)
    }
    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, { state: 'visible' });
            // this.page.waitForSelector(locator, {state: 'attached'});
            let element = await browser.getElement(this.locator)
            await element.focus();
            await element.fill(this.value);
            await browser.waitUntilLoad('networkidle');

            return String(await element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error filling ${this.locator}:`, e);
        }
    }
}