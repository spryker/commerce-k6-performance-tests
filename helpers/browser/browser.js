import {Http} from '../../lib/http.js';
import {AssertionsHelper} from '../assertions-helper.js';
import {sortRandom, toCamelCase} from '../../lib/utils.js';
import {sleep} from 'k6';
import {Profiler} from '../profiler.js';
import Url from '../../lib/url.js';
import { parseHTML } from 'k6/html';

export class Browser {
    constructor(
        page,
        basicAuth,
        metrics,
        baseUrl,
        targetEnv,
        screenShotActive = false,
        validateVisitedPage = true
    ) {
        this.page = page;
        this.page.setViewportSize({ width: 1280, height: 1680 });
        this.basicAuth = basicAuth;
        this.validateVisitedPage = validateVisitedPage;
        this.page.setExtraHTTPHeaders(this.basicAuth.getAuthHeader());
        this.urlHandler = new Url(baseUrl);
        this.metrics = metrics;
        this.screenShotActive = screenShotActive;
        this.counter = 0;
        this.store = 'default';
        this.step = '';
        this.http = new Http(targetEnv);
        this.assertionsHelper = new AssertionsHelper();
    }

    setExtraHTTPHeaders(options) {
        this.page.setExtraHTTPHeaders(options);

        return this;
    }

    resetCounter() {
        this.counter = 0;

        return this;
    }

    screen() {
        if (this.screenShotActive) {
            this.counter++;
            this.page.screenshot({
                path: `screenshot/${__ITER}_${__VU}/${this.store}/${this.counter}_${
                    this.step
                }/${this.counter}_${new Date().getTime()}.png`,
                // fullPage: true
            });
        } else {
            sleep(1);
        }
    }

    validatePageContains(targetText) {
        let doc = this.page.textContent('body')
        this.assertionsHelper.assertTextContains(doc, targetText)
    }

    ifElementExists(locator) {
        return this.getElementCount(locator) > 0;
    }

    validatePage(targetUri) {
        this.assertionsHelper.assertEqual(
            this.page.url(),
            this.getTargetUrl(targetUri)
        );
    }

    async waitUntilLoad(event = 'load', timeout = 60000) {
        await this.page.waitForLoadState(event, {timeout: timeout});
        // this.screen();
    }

    async visitPage(targetUri, metricKey = '') {
        let profiler = new Profiler();
        profiler.start(targetUri);
        await this.page.goto(this.getTargetUrl(targetUri), {
            waitUntil: 'networkidle',
        });
        await this.waitUntilLoad('networkidle');

        this.metrics.addTrend(metricKey, profiler.stop(targetUri));

        if (this.validateVisitedPage) {
            this.validatePage(targetUri);
        }

        return this;
    }

    addStep(title) {
        this.step = toCamelCase(title);
        return this;
    }

    setStore(storeCode = '') {
        this.store = storeCode;
        return this;
    }

    getCurrentUrl() {
        return this.page.url();
    }

    async waitForVisibleState(locator) {
        const target = this.page.locator(locator);
        target.waitFor({
            state: 'visible',
        });
    }

    async focus(locator) {
        const target = this.page.locator(locator);
        target.focus();
    }

    async click(locator, options = {}, timeout = 0, metricKey = '') {
        try {
            const targetElement = this.page.locator(locator);
            targetElement.focus()
            
            let profiler = new Profiler();

            let clickOptions = {};
            if (typeof options === 'object' && 'force' in options) {
                clickOptions.force = options.force;
            }

            if (typeof options === 'object' && 'timeout' in options) {
                timeout = options.timeout;
            }

            if (typeof options === 'object' && 'waitForNavigation' in options) {
                profiler.start(locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    this.page.waitForNavigation({timeout: timeout}),
                    await this.waitUntilLoad('networkidle'),
                ]);

                this.metrics.addTrend(metricKey, profiler.stop(locator));
                return this;
            }

            if (typeof options === 'object' && 'waitForLoadState' in options) {
                profiler.start(locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    this.page.waitForLoadState(),
                    await this.waitUntilLoad('networkidle'),
                ]);
                this.metrics.addTrend(metricKey, profiler.stop(locator));
                return this;
            }

            if (typeof options === 'object' && 'waitForTimeout' in options) {
                profiler.start(locator);
                await Promise.all([
                    targetElement.click(clickOptions),
                    this.page.waitForTimeout({timeout: timeout}),
                    await this.waitUntilLoad('networkidle'),
                ]);
                this.metrics.addTrend(metricKey, profiler.stop(locator));
                return this;
            }

            targetElement.click(clickOptions);
        } catch (e) {
            this.addStep(`Error select locator ${locator}`);
            console.error(e);
            this.screen();
        }

        return this;
    }

    getTargetUrl(uri) {
        return this.urlHandler.get(uri);
    }

    getTargetUrlWithoutQueryString(uri) {
        return this.urlHandler.getWithoutQueryString(uri);
    }

    scrollBottom() {
        this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        this.screen();

        return this;
    }

    getElementCount(locator) {
        return this.page.evaluate((selector) => {
            return document.querySelectorAll(selector).length;
        }, locator);
    }

    async act(actionList = []) {
        let result = true
        for (const element of actionList) {
            const sanitise = (locator) => {
                return locator.replaceAll('\\', '');
            };

            switch (element.type) {
            case 'type':
                result =
                  result &&
                  (await this.type(sanitise(element.locator), element.value));
                break;
            case 'check':
                result =
                  result &&
                  (await this.checkCheckbox(sanitise(element.locator)));
                break;
            case 'select':
                result =
                  result &&
                  (await this.selectOption(element.locator, element.value));
                break;
            case 'selectRandomBulk':
                result =
                    result &&
                    (await this.selectRandomBulk(element.locator));
                break;
            case 'selectRandomOption':
                result =
                    result &&
                    (await this.selectRandomOption(element.locator));
                break;
            case 'click':
                await this.click(sanitise(element.locator), element.options);
                break;
            case 'step':
                this.addStep(element.value);
                break;
            case 'fill':
                result =
                  result &&
                  (await this.fill(sanitise(element.locator), element.value));
                break;
            case 'scrollUp':
                await this.page.evaluate(() => {
                    window.scrollTo(0, 0);
                });
                break;
            case 'scrollDown':
                await this.page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                break;
            case 'screen':
                this.addStep(element.value);
                this.screen();
                break;
            case 'wait':
                await this.waitUntilLoad(element.waitingState, element.value);
                break;
            case 'sleep':
                sleep(element.value)
                break;
            default:
                break;
            }

            if (!result) {
                this.addStep(`Failed to execute command: ${element.type} for locator: ${element.locator}`);
                console.error(`Failed to execute command: ${element.type} for locator: ${element.locator} element: ${JSON.stringify(element)}`);
                this.screen();
            }
            await this.waitUntilLoad('networkidle');
        }

        return result;
    }

    async type(locator, value) {
        try {
            this.page.waitForSelector(locator, { state: 'visible' });
            // this.page.waitForSelector(locator, {state: 'attached'});
            let element = this.getElement(locator)
            element.focus();
            element.type(value);
            await this.waitUntilLoad('networkidle');
            return String(element.inputValue()) === String(value);
        } catch (e) {
            console.error(`Error typing ${locator}:`, e);
        }
        return false;
    }

    getElement(locator) {
        return this.page.locator(locator)
    }

    async fill(locator, value) {
        try {
            this.page.waitForSelector(locator, { state: 'visible' });
            // this.page.waitForSelector(locator, {state: 'attached'});
            let element = this.getElement(locator)
            element.focus();
            element.fill(value);
            await this.waitUntilLoad('networkidle');

            return String(element.inputValue()) === String(value);
        } catch (e) {
            console.error(`Error filling ${locator}:`, e);
        }

        return false;
    }

    async selectOption(locator, value) {
        this.page.waitForSelector(locator, {state: 'attached'});
        try {
            let element = this.getElement(locator);
            this.screen()
            await element.selectOption(value);
            this.screen()
            await this.waitUntilLoad('networkidle');

            return locator.includes('attribute') ? true : String(element.inputValue()) === String(value);
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

    async selectRandomBulk(locator) {
        this.page.waitForSelector(locator, {state: 'attached'});
        let result = true
        try {
            const doc = parseHTML(this.page.content());
            let targetSelectElements = doc.find('section[data-qa="component product-configurator"] select').toArray().map((el) => el.attr('name'))

            for (const selectName of targetSelectElements) {
                let value = this.getRandomValueFromSelectOptions(`select[name="${selectName}"]`, doc)
                result = result && await this.selectOption(`select[name="${selectName}"]`, value)
                if (selectName.includes('attribute')) {
                    this.page.waitForNavigation({timeout: 60000})
                }
            }
        } catch (e) {
            console.error('Error selecting the option:', e);
            result = false
        }

        return result;
    }

    async selectRandomOption(locator) {
        this.page.waitForSelector(locator, {state: 'attached'});
        try {
            let element = this.getElement(locator);
            let value = this.getRandomValueFromSelectOptions(locator)

            element.focus();
            element.selectOption(value);
            await this.waitUntilLoad('networkidle');

            return String(element.inputValue()) === String(value);
        } catch (e) {
            console.error('Error selecting the option:', e);
        }

        return false;
    }

    typeIf(locator, value, shouldType) {
        try {
            this.page.waitForSelector(locator, {state: 'attached'});
            if (shouldType) {
                this.type(locator, value);
            }
        } catch (e) {
            console.error(`Error typing if condition met ${locator}:`, e);
        }

        return this;
    }

    async checkCheckbox(locator, checked = true) {
        try {
            this.page.waitForSelector(locator, {state: 'attached'});
            let element = this.getElement(locator);
            element.focus();
            if (checked) {
                element.check();
            } else {
                element.uncheck();
            }

            return element.isChecked() === checked
        } catch (e) {
            this.addStep(`Error select locator ${locator}`);
            console.error(e);
            this.screen();
        }

        return false;
    }

    isEnabled(locator) {
        return this.page.locator(locator).isEnabled();
    }

    async close() {
        await this.page.close();

        return this;
    }
}
