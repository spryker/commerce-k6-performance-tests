import Default from './default.js'

export default class Fill extends Default {
    constructor(locator, value, options) {
        super('fill', locator, value, options)
    }
    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, { state: 'visible' });
            let element = await browser.getElement(this.locator)
            await element.focus();
            await element.fill(this.value, this.options);
            await browser.waitUntilLoad('networkidle');

            return String(await element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error filling ${this.locator}:`, e);
        }
    }
}