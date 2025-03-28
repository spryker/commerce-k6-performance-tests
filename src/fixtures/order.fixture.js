import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';
import { CheckoutFixture } from './checkout.fixture';
import AuthUtil from '../utils/auth.util';
import CheckoutResource from '../resources/checkout.resource';

export class OrderFixture extends AbstractFixture {
  constructor({
    customerCount = 1,
    ordersCount = 1,
    itemCount = 1,
    defaultItemPrice = 1000,
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
      let orderIds = [];

      for (let j in quoteIds) {
        let checkoutResource = new CheckoutResource(quoteIds[j], customerEmail, bearerToken, this.forceMarketplace);
        let checkoutResponse = checkoutResource.checkout();
        orderIds.push(JSON.parse(checkoutResponse.body).data.attributes.orderReference.replace('DE--', ''));
      }

      response.push({
        customerEmail,
        orderIds,
      });
    }

    return response;
  }

  static iterateData(data, vus = exec.vu.idInTest) {
    const orderIndex = (vus - 1) % data.length;

    return data[orderIndex];
  }
}
