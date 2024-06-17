import Visit from './action/visit.js';
import Screen from './action/screen.js';
import Suggest from './action/suggest.js';

export default class Search {
    constructor(browser, basicAuth, metrics) {
        this.browser = browser;
        this.basicAuth = basicAuth;
        this.metrics = metrics;
    }

    async suggest(searchQuery) {
        return await this.browser.act([
            new Screen(searchQuery),
            new Suggest('[data-qa="component search-form"] input[class="input input--expand suggest-search__input js-search-form__input--desktop suggest-search__input--transparent"]', searchQuery),
            new Screen(searchQuery)
        ])
    }

    async search(searchUrl, searchTerm) {
        return await this.browser.act([
            new Visit(`${searchUrl}${searchTerm}`, `search_results_${searchTerm}`),
            new Screen(searchUrl),
        ])
    }
}