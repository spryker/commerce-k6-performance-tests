import Fill from './action/fill.js';
import Click from './action/click.js';
import Step from './action/step.js';
import Visit from './action/visit.js';
import Screen from './action/screen.js';
import EvaluateClick from "./action/evaluateClick.js";
import ValidateTextExists from "./action/validateTextExists.js";
import {Profiler} from "../profiler.js";

export default class CustomerAccount {
    constructor(browser, metrics, timeout, email, pass) {
        this.browser = browser
        this.metrics = metrics
        this.timeout = timeout;
        this.email = email || ''
        this.pass = pass || ''
        this.profiler =  new Profiler();
    }

    async initialise() {
        await this.browser.init()
        await this.auth()
    }

    async browse() {
        await this.initialise()
        await this.visitAndAct([
            new Visit('logout', '', true)
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
        this.profiler.start('loginFlow')
        await this.browser.act([
            new Step('Login to Customer Account'),
            new Visit('DE/en/login'),
            new Step('Fill Customer Auth Credentials'),
            new Fill('[name="loginForm[email]"]', this.email),
            new Fill('[name="loginForm[password]"]', this.pass),
            new Screen('Form filled'),
            new Click('form[name="loginForm"] button[type="submit"]', {waitForNavigation: true, timeout: this.timeout, metricKey: '/DE/en/login_check'}),
            new ValidateTextExists('div.box .title--h3', 'Overview'),
            new Screen('Customer Account Page Loaded'),
        ])
        this.metrics.addTrend('loginFlow', this.profiler.stop('loginFlow'))
    }
}