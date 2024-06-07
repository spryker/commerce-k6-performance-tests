import Default from './default.js'

export default class Wait extends Default {
    constructor(value, waitingState = 'networkidle') {
        super('wait', '', value, {})
        this.waitingState = waitingState
    }
}