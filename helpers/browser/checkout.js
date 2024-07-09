import faker from 'k6/x/faker';
import Step from './action/step.js';
import Click from './action/click.js';
import Screen from './action/screen.js';
import Fill from './action/fill.js';
import Wait from './action/wait.js';
import { fail } from 'k6';
import {getIteration, getThread, sortRandom} from '../../lib/utils.js';
import SelectRandomBulk from './action/selectRandomBulk.js';
import Visit from './action/visit.js';
import ScrollDown from './action/scrollDown.js';
import TypeIf from './action/typeIf.js';
import EvaluateClick from './action/evaluateClick.js';

export default class Checkout {

    constructor(browser, basicAuth, metrics, targetLocale = 'en', cartSize = 1, timeout = 60000, useExistingAccount = false) {
        this.targetLocale = targetLocale;
        this.browser = browser
        this.timeout = timeout
        this.metrics = metrics
        this.cartSize = cartSize
        this.cartItemsAmount = 0
        this.skippedProduct = 0
        this.useExistingAccount = useExistingAccount
        this.browser.setExtraHTTPHeaders(basicAuth.getAuthHeader())
        this.customerData = {}
        this.existingAccounts = [
            'sonia@spryker.com',
            'arnold@spryker.com',
            'kevin@spryker.com',
            'emma@spryker.com',
            'donald@spryker.com',
            'karl@spryker.com',
            'maria.williams@spryker.com',
            'maggie.may@spryker.com',
            'spencor.hopkin@spryker.com',
        ]
    }

    async placeGuestOrder(paymentCode, productUris = []) {
        await this.browser.init()
        this.initCustomerData()
        this.cartItemsAmount = 0
        try {
            await this.addProductsToCart(productUris)
            await this.visitCart()
            await this.visitCheckoutAsGuest()
            await this.fillShippingInfo()
            await this.selectShippingMethod()
            await this.selectPaymentMethod(paymentCode)
            await this.createOrder()
            console.log(`Target Cart Size: ${this.cartSize}, Actual amount: ${this.cartItemsAmount}, Amount of products skipped because they are not available: ${this.skippedProduct}`)
            return this.browser.getCurrentUrl()
        } catch (e) {
            console.error(`Was not able to create an order user: ${getThread()}, iteration: ${getIteration()}: ${e.message}, ${e.stack}`)
            this.metrics.addRate(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 0)
            this.metrics.addCounter(`orders_failed_with_${this.cartItemsAmount}_unique_items`, 1)
            this.metrics.addRate(`orders_failed_with_${this.cartItemsAmount}_unique_items`, 1)

            return ''
        }
    }

    async addProductsToCart(productUris) {
        productUris = sortRandom(productUris)
        for (const productUri of productUris) {
            if (this.cartItemsAmount < this.cartSize) {
                try {
                    await this.addProduct(productUri)
                } catch (e) {
                    console.error(`Was not able to add product: ${productUri} to the shopping cart. ${e}`)
                }
            }
        }
    }

    getRandomExistingEmail() {
        sortRandom(this.existingAccounts)

        return this.existingAccounts[0]
    }

    initCustomerData() {
        this.customerData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: this.useExistingAccount ? this.getRandomExistingEmail() : faker.person.email(),
            address1: faker.address.streetName(),
            address2: faker.number.intRange(1, 100),
            zip: faker.zen.zip(),
            city: faker.address.city(),
            phone: faker.person.phone(),
        }
    }

    async addProduct(productUri) {
        await this.browser.act([
            new Step(`Visit product: ${productUri}`),
            new Visit(productUri, 'product_page_loading_time'),
            new Wait(this.timeout, 'networkidle'),
            new SelectRandomBulk('section[data-qa="component product-configurator"] select'),
            new Screen(`Select product options: ${productUri}`)
        ])

        if (this.browser.isEnabled('[data-qa="add-to-cart-button"]')) {
            await this.browser.act([
                new Click('[data-qa="add-to-cart-button"]', {waitForNavigation: true, timeout: this.timeout}),
                new Wait(this.timeout, 'networkidle'),
                new Screen(`Add product to cart ${productUri}`)
            ])
            this.cartItemsAmount++
        } else {
            this.browser.addStep('Product is not available')
            this.skippedProduct++
        }
    }

    async visitCart() {
        let result = await this.browser.act([
            new Visit(`/${this.targetLocale}/cart`, 'cart_page_loading_time'),
            new Screen('Visit shopping cart')
        ])

        if (!result) {
            fail('Fail to visit checkout.');
        }
    }

    async visitCheckoutAsGuest() {
        let result = await this.browser.act([
            new Visit(`/${this.targetLocale}/checkout/customer`, 'checkout_page_loading_time'),
            new Wait(this.timeout, 'networkidle'),
            new Screen('Visit checkout'),
            new Click('[data-qa="component toggler-radio checkoutProceedAs guest"]', {waitForTimeout: true, timeout: this.timeout, force: true}),
            new Wait(5000, 'networkidle'),
            new Screen('Select guest checkout'),
            new Step('Fill customer data'),
            new Fill('[name="guestForm[customer][first_name]"]', this.customerData.firstName),
            new Fill('[name="guestForm[customer][last_name]"]', this.customerData.lastName),
            new Fill('[name="guestForm[customer][email]"]', this.customerData.email),
            new Step('Accept terms'),
            new Click('[data-qa="component checkbox guestForm[customer][accept_terms] guestForm_customer_accept_terms"]', {waitForTimeout: true, timeout: this.timeout, force: true}),
            new Wait(120000),
            new Screen('Customer data form filled'),
        ])

        if (!result) {
            fail('Fail to fill guest form.');
        }
    }

    async fillShippingInfo() {
        let result = await this.browser.act([
            new Step('Visit shipping address page'),
            new Click('[data-qa="guest-form-submit-button"]', {waitForNavigation: true, timeout: this.timeout, metricKey: 'shipping_address_loading_time'}),
            new Wait(this.timeout, 'networkidle'),
            new Step('Fill shipping address form'),
            new Fill('[name="addressesForm[shippingAddress][zip_code]"]', this.customerData.zip),
            new Fill('[name="addressesForm[shippingAddress][city]"]', this.customerData.city),
            new Fill('[name="addressesForm[shippingAddress][phone]"]', this.customerData.phone),
            new Fill('[name="addressesForm[shippingAddress][first_name]"]', this.customerData.firstName),
            new Fill('[name="addressesForm[shippingAddress][last_name]"]', this.customerData.lastName),
            new Fill('[name="addressesForm[shippingAddress][address1]"]', this.customerData.address1),
            new Fill('[name="addressesForm[shippingAddress][address2]"]', this.customerData.address2),
            new Screen('Shipping address form filled'),
            new Wait(this.timeout, 'networkidle')
        ])

        if (!result) {
            fail('Fail to fill shipping form data');
        }
    }

    async selectShippingMethod() {
        let result = await this.browser.act([
            new Click('[data-qa="submit-address-form-button"]', {waitForNavigation: true, timeout: this.timeout, metricKey: 'shipping_method_loading_time'}),
            new Wait(this.timeout, 'networkidle'),
            new Screen('Visit shipment method page'),
        ])

        if (!result) {
            fail('Fail to visit shipping method page');
        }

        const amountOfSections = await this.browser.getElementCount('[data-qa="multi-shipment-group"]')
        let actionList = []
        for (let i = 0; i < amountOfSections; i++) {
            let targetLocator = `[data-qa="component radio shipmentCollectionForm[shipmentGroups][${i}][shipment][shipmentSelection] shipmentCollectionForm_shipmentGroups_${i}_shipment_shipmentSelection_0"]`
            actionList.push(
                new Click(targetLocator, {waitForTimeout: true, timeout: this.timeout, clickWhenExists: true}),
                new Wait(this.timeout, 'networkidle'),
            )
        }

        actionList.push(new Screen('Shipping method selected'))

        result = await this.browser.act(actionList)

        if (!result) {
            fail('Fail to select shipping method');
        }
    }

    async selectPaymentMethod(paymentCode) {
        const targetElement = `[data-qa="component toggler-radio paymentForm[paymentSelection] paymentForm_paymentSelection_${paymentCode}"]`
        let dobKey = paymentCode === 'dummyMarketplacePaymentInvoice' ? 'dateOfBirth' : 'date_of_birth'
        let shouldFillDob = paymentCode === 'dummyMarketplacePaymentInvoice' || paymentCode === 'dummyPaymentInvoice'

        let result = await this.browser.act([
            new ScrollDown(),
            new Click('[data-qa="submit-button"]', {waitForNavigation: true, timeout: this.timeout, force: true, metricKey: 'shipping_method_loading_time'}),
            new Wait(this.timeout, 'networkidle'),
            new Screen('Visit payment selection page'),
            new Click(targetElement, {waitForTimeout: true, timeout: this.timeout, clickWhenExists: true}),
            new Wait(this.timeout, 'networkidle'),
            new TypeIf(`[name="paymentForm[${paymentCode}][${dobKey}]"]`, '24.10.1990', {shouldType: shouldFillDob}),
            new Screen('Payment method selected'),
            new Click('[data-qa="submit-button"]', {waitForNavigation: true, force: true, timeout: this.timeout, metricKey: 'summary_page_loading_time'}),
            new Wait(this.timeout, 'networkidle'),
        ])

        if (!result) {
            fail('Fail to visit summary page page');
        }
    }

    async createOrder() {
        let result = await this.browser.act([
            new Screen('Visit summary page'),
            new ScrollDown(),
            new EvaluateClick('[data-qa="accept-terms-and-conditions-input"]'),
            new Wait(this.timeout, 'networkidle'),
            new Screen('Term and Conditions checked'),
            new Click('[class="form__action button button--success js-summary__submit-button"]', {waitForNavigation: true, timeout: this.timeout * 5, force: true, metricKey: 'success_page_loading_time'}),
            new Wait(this.timeout * 5, 'networkidle'),
            new Screen('Order placed'),
        ])

        if (this.browser.getCurrentUrl() === this.browser.getTargetUrlWithoutQueryString(`/${this.targetLocale}/checkout/success`) ? 1 : 0) {
            this.metrics.addCounter(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 1)
            this.metrics.addRate(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 1)
        } else {
            this.metrics.addCounter(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 0)
            this.metrics.addRate(`orders_placed_with_${this.cartItemsAmount}_unique_items`, 0)
        }
        await this.browser.validatePageContains('order has been placed')

        if (!result) {
            fail('Fail place and order');
        }
    }
}
