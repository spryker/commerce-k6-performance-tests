import Default from './default.js'

export default class UnCheck extends Default {
    constructor(locator, options) {
        super('uncheck', locator, '', options)
    }

    async act(browser) {
        try {
            browser.page.waitForSelector(this.locator, {state: 'attached'});
            let element = browser.getElement(this.locator);
            element.focus();
            element.uncheck();

            return !element.isChecked()
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            browser.screen();
        }

        return false;
    }
}