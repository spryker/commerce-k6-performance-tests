import Default from './default.js'
import {sleep} from 'k6';

export default class Sleep extends Default {
    constructor(value = 1) {
        super('sleep', '', value, {})
    }

    act(){
        sleep(this.value)
    }
}