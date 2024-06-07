import Default from './default.js'

export default class Type extends Default {
    constructor(locator, options) {
        super('type', locator, '', options)
    }
}