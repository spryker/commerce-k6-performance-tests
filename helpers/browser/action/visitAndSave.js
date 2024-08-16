import Default from './default.js'

export default class VisitAndSave extends Default {
    constructor(targetUrl, metricKey = '') {
        if (!metricKey) {
            metricKey = targetUrl
        }

        super('visitAndSave', metricKey, targetUrl)
    }

    async act(browser) {
        this.profiler.start(this.value);
        await browser.page.goto(browser.getTargetUrl(this.value), {
            waitUntil: 'networkidle',
        });

        await browser.waitUntilLoad('networkidle');

        browser.metrics.addTrend(this.locator, this.profiler.stop(this.value));
        browser.metrics.addRate(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl());
        browser.metrics.addCounter(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl() ? 1 : 0);

        if (browser.validateVisitedPage) {
            browser.validatePage(this.value);
        }
    }
}