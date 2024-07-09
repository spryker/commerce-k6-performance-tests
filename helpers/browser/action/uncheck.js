import Default from './default.js'

export default class UnCheck extends Default {
    constructor(locator, options) {
        super('uncheck', locator, '', options)
    }

    async act(browser) {
        try {
            browser.page.waitForSelector(this.locator, {state: 'attached'});
            let element = await browser.getElement(this.locator);
            await element.focus();
            await element.uncheck();

            return !(await element.isChecked())
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            await browser.screen();
        }

        return false;
    }
}