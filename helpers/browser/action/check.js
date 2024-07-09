import Default from './default.js'

export default class Check extends Default {
    constructor(locator, options) {
        super('check', locator, '', options)
    }

    async act(browser) {
        try {
            await browser.page.waitForSelector(this.locator, {state: 'attached'});
            let element = await browser.getElement(this.locator);
            await element.focus();
            element.check();

            return await element.isChecked()
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            await browser.screen();
        }

        return false;
    }
}