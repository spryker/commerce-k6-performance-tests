import Default from './default.js'

export default class Screen extends Default {
    constructor(title) {
        super('screen', '', title, {})
    }

    act(browser) {
        browser.addStep(this.value);
        browser.screen()
    }
}