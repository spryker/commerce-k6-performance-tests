import Fill from './action/fill.js';
import Click from './action/click.js';
import Step from './action/step.js';
import Visit from './action/visit.js';
import Screen from './action/screen.js';

export default class Yves {
    requireAuth = true

    constructor(browser, metrics, timeout, auth=true) {
        this.browser = browser
        this.metrics = metrics
        this.timeout = timeout;
        this.requireAuth = auth
    }

    async initialise() {
        await this.browser.init()
        if (this.requireAuth) {
            await this.auth()
        }
    }

    async browse(visitList = []) {
        await this.initialise()
        await this.visitAndAct(visitList)
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
            new Step('Login to Shop'),
            new Visit('/en/login'),
            new Step('Fill Auth Credentials'),
            // loginForm[email]=sonia+35@spryker.com&loginForm[password]=demopw123
            new Fill('[name="loginForm[email]"]', 'sonia+35@spryker.com'),
            new Fill('[name="loginForm[password]"]', 'demopw123'),
            new Screen('Form filled'),
            new Click('button[type="submit"]', {waitForNavigation: true, timeout: this.timeout}),
            new Screen('CustomerAccount'),
        ])
    }
}