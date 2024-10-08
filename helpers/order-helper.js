export default class OrderHelper {
    constructor(urlHelper, http, sapiHelper, cartHelper, assertionsHelper) {
        this.urlHelper = urlHelper;
        this.http = http;
        this.sapiHelper = sapiHelper;
        this.cartHelper = cartHelper;
        this.assertionsHelper = assertionsHelper;
    }

    haveOrder(products = {}, payment = {}) {
        const params = this.sapiHelper.getParamsWithAuthorization();
        const idCart = this.cartHelper.haveCart();

        for (let product in products) {
            this.cartHelper.addItemToCart(idCart, product.quantity, params, product.sku);
        }

        const checkoutResponse = this.http.sendPostRequest(
            this.http.url`${this.urlHelper.getStorefrontApiBaseUrl()}/checkout`,
            JSON.stringify({
                data: {
                    type: "checkout",
                    attributes: {
                        customer: {
                            salutation: "Mr",
                            email: "spencor.hopkin@spryker.com",
                            firstName: "Spencor",
                            lastName: "Hopkin"
                        },
                        idCart: idCart,
                        billingAddress: {
                            salutation: "Mr",
                            email: "spencor.hopkin@spryker.com",
                            firstName: "Spencor",
                            lastName: "Hopkin",
                            address1: "West road",
                            address2: "212",
                            address3: "",
                            zipCode: "61000",
                            city: "Berlin",
                            iso2Code: "DE",
                            company: "Spryker",
                            phone: "+380669455897"
                        },
                        shippingAddress: {
                            salutation: "Mr",
                            email: "spencor.hopkin@spryker.com",
                            firstName: "Spencor",
                            lastName: "Hopkin",
                            address1: "West road",
                            address2: "212",
                            address3: "",
                            zipCode: "61000",
                            city: "Berlin",
                            iso2Code: "DE",
                            company: "Spryker",
                            phone: "+380669455897"
                        },
                        payment: [
                            {
                                paymentMethodName: payment.paymentMethodName || "Invoice",
                                paymentProviderName: payment.paymentProviderName || "DummyPayment"
                            }
                        ],
                        shipment: {
                            idShipmentMethod: 1
                        }
                    }
                }
            }),
            params,
            false
        );

        this.assertionsHelper.assertResponseStatus(checkoutResponse, 201, 'Checkout');

        const checkoutResponseJson = JSON.parse(checkoutResponse.body);
        this.assertionsHelper.assertSingleResourceResponseBodyStructure(checkoutResponseJson, 'Checkout');

        return checkoutResponseJson.data.id;
    }
}