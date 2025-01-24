import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    cartSize = 0
    execute(products = [], maxCartSize = 1) {
        this.cartHelper.haveCartWithProducts(0);
        // this.storefrontHelper.loginUser();

        let self = this;

        group('Checkout', function () {
            self.productPage(products, maxCartSize);
            self.cartPage();
            self.checkoutPage();
            self.addressPage();
            self.shipmentPage();
            self.paymentPage();
            self.summaryPage();
        });
    }

    productPage(products = [], maxCartSize = 1) {
        if (!products.length) {
            products = [
                {
                    url: 'stapelstuhl-mit-geschlossenem-ruecken-M83',
                    sku: '657712',
                }
            ]
        }
        this.cartSize = 0
        for (const product of products) {
            //product page
            if (this.cartSize === maxCartSize) {
                break;
            }

            const productPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}${`${product.url}`}`);
            this.assertionsHelper.assertResponseStatus(productPageResponse, 200);
            this.assertionsHelper.assertResponseContainsText(productPageResponse, `<span itemprop="sku">${product.sku}</span>`);

            // add to cart form submit
            const addToCartFormSubmitResponse = this.http.submitForm(productPageResponse, {
                formSelector: `form[name="addToCartForm_${product.sku}-"]`,
                fields: {
                    'quantity': __ENV.numberOfItems,
                },
            });
            this.assertionsHelper.assertResponseStatus(addToCartFormSubmitResponse, 302);
            this.cartSize++
        }

    }

    cartPage() {
        this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/cart`);

    // TODO Items are obtained via AJAX request now, tests must be adjusted.
    // this.assertResponseBodyIncludes(cartPageResponse, '1 Items');
    // this.assertResponseBodyIncludes(cartPageResponse, 'FRIWA stackable chair - with closed back');
    }

    checkoutPage() {
        const addressStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/customer`, { redirects: 0});
        // this.assertionsHelper.assertResponseStatus(checkoutResponse, 302);

        //address form submit
        this.http.submitForm(addressStepResponse, {
            formSelector: 'form[name="guestForm"]',
            fields: {
                'guestForm[customer][first_name]': 'Test' ,
                'guestForm[customer][last_name]': 'Last' ,
                'guestForm[customer][email]': 'test.last@spryker.com',
                'guestForm[customer][accept_terms]': 1,
            },
        });
    }

    addressPage() {
    //address
        const addressStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/address`);
        this.assertionsHelper.assertResponseContainsText(addressStepResponse, 'Delivery Address');

        //address form submit
        this.http.submitForm(addressStepResponse, {
            formSelector: 'form[name="addressesForm"]',
            fields: {
                'addressesForm[shippingAddress][first_name]': 'Test',
                'addressesForm[shippingAddress][last_name]': 'Last',
                'addressesForm[shippingAddress][address1]': 'Street 12',
                'addressesForm[shippingAddress][address2]': '432',
                'addressesForm[shippingAddress][zip_code]': '12312',
                'addressesForm[shippingAddress][city]': 'Mega City',
                'addressesForm[billingSameAsShipping]': '1' ,
            },
        });
    }

    shipmentPage() {
        const shipmentStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/shipment`);

        this.assertionsHelper.assertResponseContainsText(shipmentStepResponse, 'Shipment');

        //shipment submit form
        this.http.submitForm(shipmentStepResponse, {
            formSelector: 'form[name="shipmentCollectionForm"]',
            fields: {
                'shipmentCollectionForm[shipmentGroups][0][shipment][shipmentSelection]': 1
            },
        });
    }

    paymentPage() {
        const paymentStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/payment`);
        this.assertionsHelper.assertResponseContainsText(paymentStepResponse, 'Payment');

        //payment submit form
        this.http.submitForm(paymentStepResponse, {
            formSelector: 'form[name="paymentForm"]',
            fields: this._getPaymentFormFields(),
        });
    }

    summaryPage() {
        const summaryStepResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/summary`);
        this.assertionsHelper.assertResponseContainsText(summaryStepResponse, 'Summary');

        //summary submit form and place order
        this.http.submitForm(summaryStepResponse, {
            formSelector: 'form[name="summaryForm"]',
            fields: {
                'acceptTermsAndConditions': 1
            },
        });

        this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/place-order`, { redirects: 0});
        const successPageResponse = this.http.sendGetRequest(this.http.url`${this.getStorefrontBaseUrl()}/en/checkout/success`);

        this.assertionsHelper.assertResponseContainsText(successPageResponse, 'Your order has been placed successfully.');
    }

    _getPaymentFormFields() {
        return {
            'paymentForm[paymentSelection]': 'dummyMarketplacePaymentInvoice',
            'paymentForm[dummyMarketplacePaymentInvoice][dateOfBirth]': '12.12.2000'
        };
    }
}
