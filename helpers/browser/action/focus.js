import Default from './default.js'

export default class Focus extends Default {
    constructor(locator) {
        super('focus', locator, '', {})
    }

    async act(browser) {
        const target = await browser.page.locator(this.locator);
        await target.focus();
    }
}