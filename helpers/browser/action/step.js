import Default from './default.js'
import {toCamelCase} from '../../../lib/utils.js';

export default class Step extends Default {
    constructor(title) {
        super('step', '', title, {})
    }

    async act(browser) {
        browser.step = toCamelCase(this.value);
    }
}