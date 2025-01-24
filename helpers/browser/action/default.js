import {Profiler} from '../../profiler.js';

export default class Default {
    constructor(type, locator, value, options = {}) {
        this.locator = this.sanitise(locator)
        this.options = options
        this.value = value
        this.type = type
        this.profiler = new Profiler()
    }

    sanitise(locator) {
        return String(locator).replaceAll('\\', '');
    }

    collectTotals(browser, ignoreValidation = false) {
        browser.metrics.addCounter('success_total', browser.getTargetUrl(this.value) === browser.getCurrentUrl() ? 1 : 0);
        browser.metrics.addCounter('failed_total', !ignoreValidation && browser.getTargetUrl(this.value) !== browser.getCurrentUrl() ? 1 : 0);
    }

    // eslint-disable-next-line no-unused-vars
    async act(browser) {

    }
}