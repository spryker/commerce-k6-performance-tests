import Default from './default.js'

export default class EvaluateClick extends Default {
    constructor(locator) {
        super('evaluateClick', locator, '', {})
    }

    async act(browser) {
        await browser.page.evaluate((locator) => {
             document.querySelector(locator).click()
        }, this.locator);
    }
}