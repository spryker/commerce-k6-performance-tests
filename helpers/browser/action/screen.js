import Default from './default.js'

export default class Screen extends Default {
    constructor(title) {
        super('screen', '', title, {})
    }

    async act(browser) {
        browser.addStep(this.value);
        await browser.screen()
    }
}