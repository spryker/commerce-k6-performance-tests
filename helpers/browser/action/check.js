import Default from './default.js'

export default class Check extends Default {
    constructor(locator, options) {
        super('check', locator, '', options)
    }
}