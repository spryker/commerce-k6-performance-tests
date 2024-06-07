export default class Default {
    constructor(type, locator, value, options = {}) {
        this.locator = locator
        this.options = options
        this.value = value
        this.type = type
    }
}