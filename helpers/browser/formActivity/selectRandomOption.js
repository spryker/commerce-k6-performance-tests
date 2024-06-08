import Default from './default.js'

export default class SelectRandomOption extends Default {
    constructor(locator, value, options) {
        super('selectRandom', locator, value, options)
    }
}