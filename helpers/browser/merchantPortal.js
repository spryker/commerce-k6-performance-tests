import Fill from './action/fill.js';
import Click from './action/click.js';
import Step from './action/step.js';
import Visit from './action/visit.js';
import Screen from './action/screen.js';

export default class MerchantPortal {
    constructor(browser, metrics, timeout) {
        this.browser = browser
        this.metrics = metrics
        this.timeout = timeout;
    }

    async initialise() {
        await this.browser.init()
        await this.auth()
    }

    async browse(visitList = []) {
        await this.initialise()
        await this.visitAndAct(visitList)
        await this.visitAndAct([
            new Visit('security-merchant-portal-gui/logout', '', true)
        ])
    }

    prepareAction(url) {
        if (typeof url === 'string') {
            return [
                new Step(`Start Visit ${url}`),
                new Visit(url),
                new Screen(`End Visit ${url}`),
            ]
        }

        return [
            new Step(`Start ${url.type}: ${url.locator}`),
            url,
            new Screen(`End ${url.type}: ${url.locator}`),
        ]
    }

    async visitAndAct(visitList) {
        let actions = []
        visitList.map(url => {
            actions.push(...this.prepareAction(url))
        })
        await this.browser.act(actions)
    }

    async auth() {
        await this.browser.act([
            new Step('Login to Merchant Portal'),
            new Visit('security-merchant-portal-gui/login'),
            new Step('Fill Merchant User Credentials'),
            new Fill('[id="security-merchant-portal-gui_username"]', 'martha@video-king.nl'),
            new Fill('[id="security-merchant-portal-gui_password"]', 'change123'),
            new Screen('Form filled'),
            new Click('button[type="submit"]', {waitForNavigation: true, timeout: this.timeout, clickWhenExists:true}),
            new Screen('MerchantPortalDashboard'),
        ])
    }
}