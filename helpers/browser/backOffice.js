import Fill from './action/fill.js';
import Click from './action/click.js';
import Step from './action/step.js';
import Visit from './action/visit.js';
import Screen from './action/screen.js';

export default class BackOffice {
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
            new Visit('auth/logout', '', true)
        ])
    }

    prepareAction(url) {
        if (typeof url === 'string') {
            return [
                new Step(`Visit ${url}`),
                new Visit(url),
                new Screen(`Visit ${url}`),
            ]
        }

        return [
            new Step(`Visit ${url.locator}`),
            url,
            new Screen(`Visit ${url.locator}`),
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
            new Step('Login to BackOffice'),
            new Visit('security-gui/login'),
            new Step('Fill Admin Auth Credentials'),
            new Fill('[name="auth[username]"]', 'admin@spryker.com'),
            new Fill('[name="auth[password]"]', 'change123'),
            new Screen('Form filled'),
            new Click('button[type="submit"]', {waitForNavigation: true, timeout: this.timeout}),
            new Screen('BackOffice'),
        ])
    }
}