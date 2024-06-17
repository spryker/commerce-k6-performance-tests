import Default from './default.js'

export default class TypeIf extends Default {
    constructor(locator, value, options) {
        super('typeIf', locator, value, options)
    }

    async act(browser) {
        try {
            if (this.options.shouldType) {
                await browser.waitForVisibleState(this.locator);
                let element = browser.getElement(this.locator)
                element.focus();
                element.type(this.value);
                await browser.waitUntilLoad('networkidle');

                return String(element.inputValue()) === String(this.value);
            }
        } catch (e) {
            console.error(`Error typing if condition met ${this.locator}:`, e);
        }

        return true;
    }
}