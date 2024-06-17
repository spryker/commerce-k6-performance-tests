import faker from 'k6/x/faker';
import {Profiler} from '../profiler.js';
import Step from './formActivity/step.js';
import Click from './formActivity/click.js';
import Screen from './formActivity/screen.js';
import Fill from './formActivity/fill.js';
import Wait from './formActivity/wait.js';
import { fail } from 'k6';
import {sleep} from 'k6';
import { sortRandom } from '../../lib/utils.js';
import SelectRandomBulk from './formActivity/selectRandomBulk.js';

export default class Checkout {
    constructor(browser, basicAuth, metrics, targetLocale = 'en', cartSize = 1, timeout = 1000) {
        this.targetLocale = targetLocale;
        this.browser = browser
        this.timeout = timeout
        this.metrics = metrics
        this.cartSize = cartSize
        this.cartItemsAmount = 0
        this.skippedProduct = 0
        this.browser.setExtraHTTPHeaders(basicAuth.getAuthHeader())
        this.customerData = {}
        this.profiler = new Profiler()
    }

    async placeGuestOrder(paymentCode, productUris = []) {
        this.initCustomerData()
        productUris = sortRandom(productUris)
        this.cartItemsAmount = 0
        try {
            for (const productUri of productUris) {
                if (this.cartItemsAmount < this.cartSize) {
                    try {
                        await this.addProduct(productUri)
                    } catch (e) {
                        console.error(`Was not able to add product: ${productUri} to the shopping cart. ${e}`)
                    }
                }
            }

            await this.visitCart()
            await this.visitCheckoutAsGuest()
            await this.fillShippingInfo()
            await this.fillShipping()
            await this.fillPayment(paymentCode)
            await this.createOrder()
            console.log(`Target Cart Size: ${this.cartSize}, Actual amount: ${this.cartItemsAmount}, Amount of products skipped because they are not available: ${this.skippedProduct}`)
            return this.browser.getCurrentUrl()
        } catch (e) {
            console.error(`Was not able to to create order: ${e}`)
            return ''
        }
    }

    initCustomerData() {
        this.customerData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.person.email(),
            address1: faker.address.streetName(),
            address2: faker.number.intRange(1, 100),
            zip: faker.zen.zip(),
            city: faker.address.city(),
            phone: faker.person.phone(),
        }
    }

    async addProduct(productUri) {
        this.browser.addStep(`Visit product: ${productUri}`)
        await this.browser.visitPage(productUri, 'product_page_loading_time')
        await this.browser.waitUntilLoad('networkidle', this.timeout)

        await this.browser.act([
            new SelectRandomBulk('section[data-qa="component product-configurator"] select')
        ])

        this.browser.screen()
        if (this.browser.isEnabled('[data-qa="add-to-cart-button"]')) {
            this.browser.addStep('Add product to cart')
            await this.browser.click('[data-qa="add-to-cart-button"]', {waitForNavigation: true}, this.timeout)
            this.cartItemsAmount++
        } else {
            this.browser.addStep('Product is not available')
            this.skippedProduct++
        }
    }

    async visitCart() {
        this.browser.addStep('Visit shopping cart')
        await this.browser.visitPage(`/${this.targetLocale}/cart`, 'cart_page_loading_time')
    }

    async visitCheckoutAsGuest() {
        this.browser.addStep('Visit checkout')
        await this.browser.visitPage(`/${this.targetLocale}/checkout/customer`, 'checkout_page_loading_time')
        await this.browser.waitUntilLoad('networkidle', this.timeout)

        let result = await this.browser.act([
            new Step('Select guest checkout'),
            new Click('[data-qa="component toggler-radio checkoutProceedAs guest"]', {waitForTimeout: true, timeout: 5000, force: true}),
            new Wait(5000, 'networkidle'),
            new Screen('Select guest checkout'),
            new Step('Fill customer data'),
            new Fill('[name="guestForm[customer][first_name]"]', this.customerData.firstName),
            new Fill('[name="guestForm[customer][last_name]"]', this.customerData.lastName),
            new Fill('[name="guestForm[customer][email]"]', this.customerData.email),
            new Step('Accept terms'),
            new Click('[data-qa="component checkbox guestForm[customer][accept_terms] guestForm_customer_accept_terms"]', {waitForTimeout: true, timeout: 5000, force: true}),
            new Wait(120000),
            new Screen('Fill customer data form filled'),
        ])

        if (!result) {
            fail('Fail to fill guest form.');
        }
    }

    async fillShippingInfo() {
        this.browser.addStep('Visit shipping address page')
        await this.browser.click('[data-qa="guest-form-submit-button"]', {waitForNavigation: true}, this.timeout, 'shipping_address_loading_time')
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        
        let result = await this.browser.act([
            new Step('Fill shipping address form'),
            new Fill('[name="addressesForm[shippingAddress][zip_code]"]', this.customerData.zip),
            new Fill('[name="addressesForm[shippingAddress][city]"]', this.customerData.city),
            new Fill('[name="addressesForm[shippingAddress][phone]"]', this.customerData.phone),
            new Fill('[name="addressesForm[shippingAddress][first_name]"]', this.customerData.firstName),
            new Fill('[name="addressesForm[shippingAddress][last_name]"]', this.customerData.lastName),
            new Fill('[name="addressesForm[shippingAddress][address1]"]', this.customerData.address1),
            new Fill('[name="addressesForm[shippingAddress][address2]"]', this.customerData.address2),
            new Screen('Fill shipping address form filled'),
        ])
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        if (!result) {
            fail('Fail to fill shipping form data');
        }
    }

    async fillShipping() {
        await this.browser.click('[data-qa="submit-address-form-button"]', {waitForNavigation: true}, this.timeout, 'shipping_method_loading_time')
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        this.browser.addStep('Visit shipment method page')

        const amountOfSections = this.browser.getElementCount('[data-qa="multi-shipment-group"]')
        for (let i = 0; i < amountOfSections; i++) {
            let targetLocator = `[data-qa="component radio shipmentCollectionForm[shipmentGroups][${i}][shipment][shipmentSelection] shipmentCollectionForm_shipmentGroups_${i}_shipment_shipmentSelection_0"]`
            if (this.browser.ifElementExists(targetLocator)) {
                await this.browser.click(targetLocator, {waitForTimeout: true}, this.timeout)
            }
        }
    }

    async fillPayment(paymentCode) {
        this.browser.addStep('Visit payment selection page')
        await this.browser.waitUntilLoad()
        this.browser.scrollBottom()
        await this.browser.click('[data-qa="submit-button"]', {
            waitForNavigation: true,
            force: true
        }, this.timeout, 'shipping_method_loading_time')
        await this.browser.waitUntilLoad()

        const targetElement = `[data-qa="component toggler-radio paymentForm[paymentSelection] paymentForm_paymentSelection_${paymentCode}"]`
        if (this.browser.getElementCount(targetElement) > 0) {
            await this.browser.click(targetElement, {waitForTimeout: true}, this.timeout)
            let dobKey = paymentCode === 'dummyMarketplacePaymentInvoice' ? 'dateOfBirth' : 'date_of_birth'
            this.browser.typeIf(`[name="paymentForm[${paymentCode}][${dobKey}]"]`, '24.10.1990', paymentCode === 'dummyMarketplacePaymentInvoice' || paymentCode === 'dummyPaymentInvoice')
        }
        await this.browser.click('[data-qa="submit-button"]', {
            waitForNavigation: true,
            force: true
        }, this.timeout, 'summary_page_loading_time')
    }

    async createOrder() {
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        this.browser.scrollBottom()

        this.browser.page.evaluate(() => {
            document.querySelector('[data-qa="accept-terms-and-conditions-input"]').click()
        });
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        this.browser.addStep('Check term and conditions')
        this.browser.screen()
        await this.browser.click('[class="form__action button button--success js-summary__submit-button"]', {waitForTimeout: true}, this.timeout, 'success_page_loading_time')
        await this.browser.waitUntilLoad('networkidle', this.timeout)
        this.browser.addStep('Visit summary page')
        sleep(1)
        this.browser.screen()
        if (this.browser.getCurrentUrl() === this.browser.getTargetUrlWithoutQueryString(`/${this.targetLocale}/checkout/success`) ? 1 : 0) {
            this.metrics.addCounter(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 1)
        } else {
            this.metrics.addCounter(`orders_failed_with_${this.cartItemsAmount}_unique_items`, 1)
        }
        this.browser.validatePageContains('order has been placed')
    }
}
