import { CustomerFixture } from './customer.fixture';
import AuthUtil from '../../utils/auth.util';
import CartsResource from '../../resources/carts.resource';
import RandomUtil from '../../utils/random.util';

export class CartFixture {
  constructor({ customerCount = 1, cartCount = 1, itemCount = 1, randomItems = false }) {
    this.customerCount = customerCount;
    this.cartCount = cartCount;
    this.itemCount = itemCount;
    this.randomItems = randomItems;
  }

  getData() {
    const customers = new CustomerFixture({
      customerCount: this.customerCount,
      itemCount: this.itemCount,
      randomItems: this.randomItems,
    }).getData();

    return customers.map((customer, idx) => {
      const bearerToken = AuthUtil.getInstance().getBearerToken(customer.customerEmail, customer.customerPassword);
      const cartsResource = new CartsResource(bearerToken);
      const cartIds = [];
      for (let i = 0; i < this.cartCount; i++) {
        const cartName = `static-cart-${idx + 1}-${i + 1}`;
        const response = cartsResource.create(cartName);

        if (response.status !== 201) {
          throw new Error(`Failed to create cart: ${response.body}`);
        }

        const cartId = JSON.parse(response.body).data.id;
        cartIds.push(cartId);
      }

      const productSkus = (customer.products || []).map((p) => p.sku);
      return {
        customerEmail: customer.customerEmail,
        customerPassword: customer.customerPassword,
        cartIds,
        productSkus,
      };
    });
  }

  iterateData(data, vus = null) {
    let record;
    if (vus) {
      record = data[vus - 1];
    } else {
      record = RandomUtil.getRandomItem(data);
    }
    return {
      customerEmail: record.customerEmail,
      customerPassword: record.customerPassword,
      idCart: record.cartIds[0],
      productSku: record.productSkus[0],
    };
  }
}
