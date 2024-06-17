export default class Default {
    constructor(type, locator, value, options = {}) {
        this.locator = this.sanitise(locator)
        this.options = options
        this.value = value
        this.type = type
    }

    sanitise(locator) {
        return String(locator).replaceAll('\\', '');
    }

    // eslint-disable-next-line no-unused-vars
    async act(browser) {

    }
}