import Default from './default.js'

export default class ClearHidden extends Default {
    constructor(locator, options) {
        super('clear', locator, '', options)
    }
    async act(browser) {
        try {
            let element = await browser.getElement(this.locator)
            element.value = ''

            return String(await element.inputValue()) === String(this.value);
        } catch (e) {
            console.error(`Error filling ${this.locator}:`, e);
        }
    }
}