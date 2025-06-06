import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';
import { CheckoutFixture } from './checkout.fixture';
import AuthUtil from '../utils/auth.util';
import CheckoutResource from '../resources/checkout.resource';
import { LoginPage } from '../pages/bo/login.page';
import SalesPage from '../pages/bo/sales.page';
import AbstractResource from '../resources/abstract.resource';
import { parseHTML } from 'k6/html';

const EVENT_PAY = 'pay';
const EVENT_SKIP_GRACE_PERIOD = 'skip grace period';
const OMS_TRIGGER_FORM_TOKEN_SELECTOR = '#oms_trigger_form__token';

export class OrderFixture extends AbstractFixture {
  constructor({
    customerCount = 1,
    ordersCount = 1,
    itemCount = 1,
    defaultItemPrice = 10000,
    forceMarketplace = false,
  }) {
    super();
    this.customerCount = customerCount;
    this.ordersCount = ordersCount;
    this.itemCount = itemCount;
    this.defaultItemPrice = defaultItemPrice;
    this.forceMarketplace = forceMarketplace;
  }

  getData() {
    const dynamicFixture = new CheckoutFixture({
      customerCount: this.customerCount,
      cartCount: this.ordersCount,
      itemCount: this.itemCount,
      defaultItemPrice: this.defaultItemPrice,
      forceMarketplace: this.forceMarketplace,
    });

    const data = dynamicFixture.getData();

    let response = [];
    for (let i in data) {
      let customerEmail = data[i].customerEmail;
      let quoteIds = data[i].quoteIds;

      let bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
      let orderReferences = [];

      for (let j in quoteIds) {
        let checkoutResource = new CheckoutResource(quoteIds[j], customerEmail, bearerToken, this.forceMarketplace);
        let checkoutResponse = checkoutResource.checkout();
        orderReferences.push(JSON.parse(checkoutResponse.body).data.attributes.orderReference.replace('DE--', ''));
      }

      response.push({
        customerEmail,
        orderReferences,
      });
    }

    return response;
  }

  iterateData(data, vus = exec.vu.idInTest) {
    const orderIndex = (vus - 1) % data.length;

    return data[orderIndex];
  }

  preparePaidOrders(data) {
    const loginPage = new LoginPage();
    const headers = loginPage.login();
    const salesPage = new SalesPage(headers);
    const abstractResource = new AbstractResource();

    abstractResource.runConsoleCommands([
      'vendor/bin/console oms:check-condition',
      'vendor/bin/console oms:check-timeout',
    ]);

    for (let i in data) {
      const { orderReferences } = data[i];
      for (let j in orderReferences) {
        let orderId = salesPage.retrieveOrderIdByReference(orderReferences[j]);

        const salesDetailPageResponse = salesPage.get(orderId);
        let omsTriggerFormToken = parseHTML(salesDetailPageResponse.body)
          .find(OMS_TRIGGER_FORM_TOKEN_SELECTOR)
          .attr('value');

        salesPage.triggerEvent(orderId, EVENT_SKIP_GRACE_PERIOD, omsTriggerFormToken);
      }
    }

    abstractResource.runConsoleCommands([
      'vendor/bin/console oms:check-condition',
      'vendor/bin/console oms:check-timeout',
    ]);

    for (let i in data) {
      const { orderReferences } = data[i];
      for (let j in orderReferences) {
        let orderId = salesPage.retrieveOrderIdByReference(orderReferences[j]);

        const salesDetailPageResponse = salesPage.get(orderId);
        let omsTriggerFormToken = parseHTML(salesDetailPageResponse.body)
          .find(OMS_TRIGGER_FORM_TOKEN_SELECTOR)
          .attr('value');

        salesPage.triggerEvent(orderId, EVENT_PAY, omsTriggerFormToken);
      }
    }

    abstractResource.runConsoleCommands([
      'vendor/bin/console oms:check-condition',
      'vendor/bin/console oms:check-timeout',
    ]);
  }
}
