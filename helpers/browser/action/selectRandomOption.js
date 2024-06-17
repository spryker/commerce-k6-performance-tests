import Default from './default.js'
import {sortRandom} from '../../../lib/utils.js';
import { parseHTML } from 'k6/html';

export default class SelectRandomOption extends Default {
    constructor(locator, value, options) {
        super('selectRandomOption', locator, value, options)
    }
    async act(browser) {
        browser.page.waitForSelector(this.locator, {state: 'attached'});
        try {
            let element = browser.getElement(this.locator);
            let value = browser.getRandomValueFromSelectOptions(this.locator)

            element.focus();
            element.selectOption(value);
            await this.waitUntilLoad('networkidle');

            return String(element.inputValue()) === String(value);
        } catch (e) {
            console.error('Error selecting the option:', e);
        }

        return false;
    }

    getRandomValueFromSelectOptions(locator, htmlDocument = null) {
        const doc = htmlDocument ? htmlDocument : parseHTML(this.page.content());
        let optionsValues = doc.find(`${locator} option`).toArray().map((option) => String(option.attr('value')));
        optionsValues.shift()
        optionsValues = sortRandom(optionsValues)

        return optionsValues.shift()
    }
}