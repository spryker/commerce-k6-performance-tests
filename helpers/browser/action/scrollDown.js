import Default from './default.js'

export default class ScrollDown extends Default {
    constructor() {
        super('scrollDown', '', '', {})
    }

    async act(browser){
        await browser.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
    }
}