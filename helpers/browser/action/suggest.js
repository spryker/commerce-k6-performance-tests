import Default from './default.js'
import Screen from './screen.js';

export default class Suggest extends Default {
    constructor(locator, searchQuery, options = {}) {
        super('suggest', locator, searchQuery, options)
    }

    sanitiseSearchTerm(target) {
        const regex = /[^a-zA-Z0-9-]+/g;

        return target.replace(regex, '--');
    }

    async act(browser) {
        const searchInput = await browser.page.locator(this.locator);
        await searchInput.focus();
        await searchInput.clear();
        let searchTerm = this.sanitiseSearchTerm(this.value)
        browser.page.evaluate((searchTerm) => window.performance.mark(`search-suggest-${searchTerm}`), searchTerm);
        await searchInput.type(this.value);
        const resultsContainer = await browser.page.locator('.suggest-search__container:not(.is-hidden)');
        await resultsContainer.waitFor();

        browser.page.evaluate((searchTerm) => window.performance.mark(`action-completed-${searchTerm}`), searchTerm);
        browser.page.evaluate((searchTerm) => window.performance.measure(
            `total-action-time-${searchTerm}`,
            `search-suggest-${searchTerm}`,
            `action-completed-${searchTerm}`
        ), searchTerm);

        const totalActionTime = await browser.page.evaluate((searchTerm) => {
            return JSON.parse(JSON.stringify(window.performance.getEntriesByName(`total-action-time-${searchTerm}`))).pop().duration
        }, searchTerm);

        await browser.act([
            new Screen(`Search "${searchTerm}" results`)
        ])

        browser.metrics.addTrend(`suggest_results_${searchTerm}`, totalActionTime)
        browser.metrics.addRate(`suggest_results_${searchTerm}`, 1)
        browser.metrics.addCounter(`suggest_results_${searchTerm}`, 1)
        browser.metrics.addCounter('suggest_results_total', 1)
    }
}