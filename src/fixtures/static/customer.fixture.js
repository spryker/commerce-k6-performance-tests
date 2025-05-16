import { SharedArray } from 'k6/data';
import { randomIntBetween } from '../../utils/uuid.util';
import papaparse from "@babel/core/lib/parse";
import RandomUtil from "../../utils/random.util";

const DEFAULT_PASSWORD = 'change123';

const customersCsv = new SharedArray('customers', function () {
  return papaparse.parse(open('./static-data/customers.csv'), { header: true }).data;
});

const abstractProductsCsv = new SharedArray('abstract_products', function () {
  return papaparse.parse(open('./static-data/abstract_products.csv'), { header: true }).data;
});

const concreteProductsCsv = new SharedArray('concrete_products', function () {
  return papaparse.parse(open('./static-data/concrete_products.csv'), { header: true }).data;
});

export class CustomerFixture {
  constructor({ customerCount, itemCount = 1, randomItems = false }) {
    this.customerCount = customerCount;
    this.itemCount = itemCount;
    this.randomItems = randomItems;
  }

  getData(customerCount = this.customerCount) {
    this.customerCount = customerCount;

    const abstractProductMap = {};
    abstractProductsCsv.forEach((product) => {
      abstractProductMap[product.id_product_abstract] = product;
    });

    const limitedCustomers = this.customerCount ? customersCsv.slice(0, this.customerCount) : customersCsv;

    return limitedCustomers.map((customer) => {
      const products = [];
      for (let i = 0; i < this.itemCount; i++) {
        const index = this.randomItems ? randomIntBetween(0, concreteProductsCsv.length - 1) : i;
        const product = concreteProductsCsv[index];
        const abstractProduct = abstractProductMap[product.fk_product_abstract] || {};

        products.push({
          id: product.id_product_concrete,
          sku: product.sku,
          abstractSku: abstractProduct.abstract_sku,
          abstractId: abstractProduct.fk_product_abstract,
          url: abstractProduct.url,
        });
      }

      return {
        customerEmail: customer.email,
        customerPassword: customer.password || DEFAULT_PASSWORD,
        products: products,
      };
    });
  }

  static iterateData(data, vus = null) {
    if (vus) {
      return data[vus - 1];
    }

    return RandomUtil.getRandomItem(data);
  }
}
