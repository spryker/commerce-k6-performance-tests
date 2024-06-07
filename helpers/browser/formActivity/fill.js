import Default from './default.js'

export default class Fill extends Default {
    constructor(locator, value, options) {
        super('fill', locator, value, options)
    }
}