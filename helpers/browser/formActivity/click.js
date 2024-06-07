import Default from './default.js'

export default class Click extends Default {
    constructor(locator, options) {
        super('click', locator, '', options)
    }
}