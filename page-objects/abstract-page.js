export class AbstractPage {
    constructor(page, baseUrl) {
        this.page = page;
        this.baseUrl = baseUrl;
    }

    setPage(page) {
        this.page = page;
    }
}