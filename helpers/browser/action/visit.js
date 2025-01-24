import Default from './default.js'

export default class Visit extends Default {
    ignoreValidation = false;
    constructor(targetUrl, metricKey = '', ignoreValidation = false) {
        if (!metricKey) {
            metricKey = targetUrl
        }

        super('visit', metricKey, targetUrl)
        this.ignoreValidation = ignoreValidation;
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
        this.collectTotals(browser, this.ignoreValidation)

        if (browser.validateVisitedPage && !this.ignoreValidation) {
            browser.validatePage(this.value);
        }
    }
}