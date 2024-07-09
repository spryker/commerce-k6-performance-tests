import Default from './default.js'

export default class TypeIf extends Default {
    constructor(locator, value, options) {
        super('typeIf', locator, value, options)
    }

    async act(browser) {
        try {
            if (this.options.shouldType) {
                await browser.waitForVisibleState(this.locator);
                let element = await browser.getElement(this.locator)
                await element.focus();
                await element.type(this.value);
                await browser.waitUntilLoad('networkidle');

                return String(await element.inputValue()) === String(this.value);
            }
        } catch (e) {
            console.error(`Error typing if condition met ${this.locator}:`, e);
        }

        return true;
    }
}