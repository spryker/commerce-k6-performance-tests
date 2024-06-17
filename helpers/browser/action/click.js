import Default from './default.js'
import {Profiler} from '../../profiler.js';

export default class Click extends Default {
    constructor(locator, options) {
        super('click', locator, '', options)
    }

    async act(browser) {
        try {
            let timeout = 0
            let metricKey = ''
            let requireValidationBeforeClick = typeof this.options === 'object' && 'clickWhenExists' in this.options && this.options.clickWhenExists === true

            if (requireValidationBeforeClick && !browser.ifElementExists(this.locator)) {
                return true
            }

            const targetElement = browser.page.locator(this.locator);
            targetElement.focus()

            let profiler = new Profiler();

            let clickOptions = {};
            if (typeof this.options === 'object' && 'force' in this.options) {
                clickOptions.force = this.options.force;
            }

            if (typeof this.options === 'object' && 'timeout' in this.options) {
                timeout = this.options.timeout;
            }

            if (typeof this.options === 'object' && 'metricKey' in this.options) {
                metricKey = this.options.metricKey;
            }

            if (typeof this.options === 'object' && 'waitForNavigation' in this.options) {
                profiler.start(this.locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    browser.page.waitForNavigation({timeout: timeout}),
                    await browser.waitUntilLoad('networkidle'),
                ]);

                browser.metrics.addTrend(metricKey, profiler.stop(this.locator));
                return true;
            }

            if (typeof this.options === 'object' && 'waitForLoadState' in this.options) {
                profiler.start(this.locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    browser.page.waitForLoadState(),
                    await browser.waitUntilLoad('networkidle'),
                ]);
                browser.metrics.addTrend(metricKey, profiler.stop(this.locator));
                return true;
            }

            if (typeof this.options === 'object' && 'waitForTimeout' in this.options) {
                profiler.start(this.locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    browser.page.waitForTimeout({timeout: timeout}),
                    await browser.waitUntilLoad('networkidle'),
                ]);
                browser.metrics.addTrend(metricKey, profiler.stop(this.locator));
                return true;
            }

            targetElement.click(clickOptions);
        } catch (e) {
            browser.addStep(`Error select locator ${this.locator}`);
            console.error(e);
            browser.screen();
            return false
        }

        return true;
    }
}