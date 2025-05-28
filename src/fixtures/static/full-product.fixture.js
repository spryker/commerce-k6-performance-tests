import { SharedArray } from 'k6/data';
import papaparse from '@babel/core/lib/parse';
import RandomUtil from '../../utils/random.util';

const abstractProductsCsv = new SharedArray('abstract_products', function () {
  return papaparse.parse(open('./assets/fixtures/abstract_products.csv'), { header: true }).data;
});

const concreteProductsCsv = new SharedArray('concrete_products', function () {
  return papaparse.parse(open('./assets/fixtures/concrete_products.csv'), { header: true }).data;
});

export class FullProductFixture {
  constructor({ productCount = 1 }) {
    this.productCount = productCount;
  }

  getData() {
    const abstractProductMap = {};
    abstractProductsCsv.forEach((product) => {
      abstractProductMap[product.id_product_abstract] = product;
    });

    const limitedProducts = this.productCount ? concreteProductsCsv.slice(0, this.productCount) : concreteProductsCsv;

    return limitedProducts.map((product) => {
      const abstractProduct = abstractProductMap[product.fk_product_abstract] || {};

      return {
        id: product.id_product_concrete,
        sku: product.sku,
        abstractSku: abstractProduct.abstract_sku || '',
        abstractId: product.fk_product_abstract,
        url: abstractProduct.url,
      };
    });
  }

  iterateData(data) {
    return RandomUtil.getRandomItem(data);
  }
}
