import Default from './default.js'

export default class ScrollUp extends Default {
    constructor() {
        super('scrollUp', '', '', {})
    }

    async act(browser){
        await browser.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
    }
}