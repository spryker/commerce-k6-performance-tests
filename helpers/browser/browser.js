import {Http} from '../../lib/http.js';
import {AssertionsHelper} from '../assertions-helper.js';
import { toCamelCase} from '../../lib/utils.js';
import {sleep} from 'k6';
import Url from '../../lib/url.js';

export class Browser {
    constructor(
        page,
        basicAuth,
        metrics,
        baseUrl,
        targetEnv,
        screenShotActive = false,
        validateVisitedPage = true,
        screenResolution = { width: 1280, height: 1680 }
    ) {
        this.page = page;
        this.screenResolution = screenResolution
        this.page.setViewportSize(this.screenResolution);
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
                path: `screenshot/${__VU}/${__ITER}/${this.store}/${this.counter}_${
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

    addStep(title) {
        if (title.length) {
            this.step = toCamelCase(title);
        }

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

    getTargetUrl(uri) {
        return this.urlHandler.get(uri);
    }

    getTargetUrlWithoutQueryString(uri) {
        return this.urlHandler.getWithoutQueryString(uri);
    }

    getElementCount(locator) {
        return this.page.evaluate((selector) => document.querySelectorAll(selector).length, locator);
    }

    async act(actionList = []) {
        let result = true
        for (const element of actionList) {
            switch (element.type) {
            case 'visit':
            case 'suggest':
            case 'screen':
            case 'wait':
            case 'sleep':
            case 'step':
            case 'scrollDown':
            case 'scrollUp':
            case 'evaluateClick':
                await element.act(this);
                break;
            case 'type':
            case 'typeIf':
            case 'check':
            case 'select':
            case 'selectRandomBulk':
            case 'selectRandomOption':
            case 'click':
            case 'fill':
                result = result && await element.act(this)
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

    getElement(locator) {
        return this.page.locator(locator)
    }

    isEnabled(locator) {
        return this.page.locator(locator).isEnabled();
    }

    async close() {
        await this.page.close();

        return this;
    }
}
