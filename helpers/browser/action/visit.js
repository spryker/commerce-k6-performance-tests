import Default from './default.js'
import {Profiler} from '../../profiler.js';

export default class Visit extends Default {
    constructor(targetUrl, metricKey = '') {
        super('visit', metricKey, targetUrl)
    }

    async act(browser) {
        let profiler = new Profiler();
        profiler.start(this.value);
        await browser.page.goto(browser.getTargetUrl(this.value), {
            waitUntil: 'networkidle',
        });

        await browser.waitUntilLoad('networkidle');

        browser.metrics.addTrend(this.locator, profiler.stop(this.value));
        browser.metrics.addRate(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl());
        browser.metrics.addCounter(this.locator, browser.getTargetUrl(this.value) === browser.getCurrentUrl() ? 1 : 0);

        if (browser.validateVisitedPage) {
            browser.validatePage(this.value);
        }
    }
}