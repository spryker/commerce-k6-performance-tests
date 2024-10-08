import {AbstractScenario} from "../../../../abstract-scenario.js";

export class SharedViewOrderHistoryScenario extends AbstractScenario {
    execute() {
        this.storefrontHelper.loginUser();
        const idOrder = this.orderHelper.haveOrder(this._getProducts(), {
            paymentMethodName: 'Invoice (Marketplace)',
            paymentProviderName: 'DummyPayment',
        });

        let self = this;

        group('Order History', function () {
            self.orderHistoryPage();
        });
    }

    orderHistoryPage() {
        const orderHistoryPageResponse = this.http.sendGetRequest(this.getStorefrontBaseUrl() + '/en/customer/order');

        this.assertionsHelper.assertResponseStatus(orderHistoryPageResponse, 200);
        this.assertionsHelper.assertResponseContainsText(orderHistoryPageResponse, '<h3>Order history</h3>');
    }

    _getProducts() {
        const productSkus = this.productHelper.getNeverOutStockProductSkus(10);

        return productSkus.map(sku => {
            return {
                'sku': sku,
                'quantity': 1,
            };
        });
    }
}