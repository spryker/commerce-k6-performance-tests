import Default from './default.js'
import Click from './click.js';

export default class VisitAndSave extends Default {
    constructor(targetUrl, clickLocator = 'input[type="submit"][value="Save"]', metricKey = '') {
        if (!metricKey) {
            metricKey = targetUrl
        }

        super('visitAndSave', metricKey, targetUrl)
        this.clickLocator = clickLocator
    }

    async act(browser) {
        await browser.page.goto(browser.getTargetUrl(this.value), {
            waitUntil: 'networkidle',
        });

        await browser.waitUntilLoad('networkidle');

        if (browser.validateVisitedPage) {
            browser.validatePage(this.value);
        }

        this.profiler.start(this.value);

        let res = await new Click(this.clickLocator, {waitForNavigation: true, force: true, timeout: this.timeout, metricKey: this.locator}).act(browser)

        console.warn(`Click result for locator: ${this.locator}`, res)

        browser.metrics.addTrend(this.locator, this.profiler.stop(this.value));
        browser.metrics.addRate(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl());
        browser.metrics.addCounter(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl() ? 1 : 0);

    }
}