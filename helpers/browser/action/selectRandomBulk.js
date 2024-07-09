import { parseHTML } from 'k6/html';
import SelectOption from './selectOption.js';

export default class SelectRandomBulk extends SelectOption {
    constructor(locator, value, options) {
        super('selectRandomBulk', locator, value, options)
        this.locator = this.sanitise(locator)
    }

    async act(browser) {
        await browser.page.waitForSelector(this.locator, {state: 'attached'});
        let result = true
        try {
            const doc = parseHTML(browser.page.content());
            let targetSelectElements = doc.find('section[data-qa="component product-configurator"] select').toArray().map((el) => el.attr('name'))

            for (const selectName of targetSelectElements) {
                let value = this.getRandomValueFromSelectOptions(`select[name="${selectName}"]`, doc)
                result = result && await (new SelectOption(`select[name="${selectName}"]`, value)).act(browser)
                if (selectName.includes('attribute')) {
                    await browser.page.waitForNavigation({timeout: 60000})
                }
            }
        } catch (e) {
            console.error('Error selecting the option:', e);
            result = false
        }

        return result;
    }
}