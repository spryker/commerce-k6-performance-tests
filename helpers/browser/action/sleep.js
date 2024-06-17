import Default from './default.js'

export default class Sleep extends Default {
    constructor(value = 1) {
        super('sleep', '', value, {})
    }
}