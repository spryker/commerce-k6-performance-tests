import Default from './default.js'

export default class SelectOption extends Default {
    constructor(locator, value, options) {
        super('select', locator, value, options)
    }
}