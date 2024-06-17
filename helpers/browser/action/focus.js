import Default from './default.js'

export default class Focus extends Default {
    constructor(locator) {
        super('focus', locator, '', {})
    }

    async act(browser) {
        const target = browser.page.locator(this.locator);
        target.focus();
    }
}