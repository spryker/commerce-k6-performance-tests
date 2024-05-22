import { parseHTML } from 'k6/html';
import {Profiler} from "../profiler.js";

export default class Catalog {
    constructor(browser, metrics) {
        this.browser = browser
        this.metrics = metrics
    }

    /**
     * Iterate catalog pages and collect products from them.
     *
     * @param catalogPages string[]
     * @returns {Promise<string[]>}
     */
    async processCatalogPages(catalogPages) {
        let urls = []
        for (const catalogPage of catalogPages) {
            await this.browser.visitPage(catalogPage, 'catalog_page_loading_time')
            const doc = parseHTML(this.browser.page.content());
            urls.push(...new Set(doc
                .find('a.js-product-item__link-detail-page')
                .toArray()
                .map((item) => item.attr('href'))))
        }

        return urls
    }

    /**
     * Collect pages uris for the given category page.
     *
     * @param pageContent string
     * @returns {string[]}
     */
    getCatalogPages(pageContent) {
        const doc = parseHTML(pageContent);
        let url = [...new Set(doc
            .find('a.pagination__step')
            .toArray()
            .map((item) => item.attr('href')))].pop()

        let match = url.match(/[\?&]page=(\d+)/)
        let maxPage = 1
        if (match) {
            maxPage = match[1]
        }

        let urls = []
        for (let i = 1; i <= maxPage; i++) {
            urls.push(url.replace(`page=${maxPage}`, `page=${i}`))
        }

        return urls
    }

    /**
     * Collect product`s uris from the given categories.
     *
     * @param catalogPages string[]
     * @returns {Promise<string[]>}
     */
    async getAllProductsUri(catalogPages = []) {
        let uris = []
        for (const catalogPage of catalogPages) {
            await this.browser.visitPage(catalogPage, 'catalog_page_loading_time')
            let catalogPages = this.getCatalogPages(this.browser.page.content())
            uris.push(...await this.processCatalogPages(catalogPages))
        }

        return uris
    }
}