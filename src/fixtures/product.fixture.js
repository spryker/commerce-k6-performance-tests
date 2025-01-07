import { AbstractFixture } from './abstract.fixture.js';

const DEFAULT_IMAGE_SMALL = 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg';
const DEFAULT_IMAGE_LARGE = 'https://images.icecat.biz/img/gallery/30691822_1486.jpg';
const DEFAULT_STOCK_ID = 1;
const DEFAULT_STOCK_NAME = 'Warehouse1';

export class ProductFixture extends AbstractFixture {
  constructor({ productCount = 1 }) {
    super();
    this.productCount = productCount;
  }

  getData() {
    const response = this.runDynamicFixture(this._getProductsPayload());

    const responseData = JSON.parse(response.body).data;
    const products = responseData.filter((item) => /^product\d+$/.test(item.attributes.key));

    console.log(products);

    // Return list
    return products;
  }

  iterateData(data, vus = __VU, iterations = __ITER) {
  }

  _getProductsPayload() {
    const baseOperations = [
      {
        type: 'transfer',
        name: 'ProductImageTransfer',
        key: 'productImage',
        arguments: {
          externalUrlSmall: DEFAULT_IMAGE_SMALL,
          externalUrlLarge: DEFAULT_IMAGE_LARGE,
        },
      },
    ];

    const products = Array.from({ length: this.productCount }, (_, i) => this._createProductPayload(i)).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...baseOperations, ...products],
        },
      },
    });
  }

  _createProductPayload(index) {
    const productKey = `product${index + 1}`;
    return [
      {
        type: 'helper',
        name: 'haveFullProduct',
        key: productKey,
        arguments: [{}, { idTaxSet: 1 }],
      },
      {
        type: 'helper',
        name: 'haveProductImageSet',
        arguments: [
          {
            name: 'default',
            idProduct: `#${productKey}.id_product_concrete`,
            idProductAbstract: `#${productKey}.fk_product_abstract`,
            productImages: ['#productImage'],
          },
        ],
      },
      {
        type: 'helper',
        name: 'havePriceProduct',
        arguments: [
          {
            skuProductAbstract: `#${productKey}.abstract_sku`,
            skuProduct: `#${productKey}.sku`,
            moneyValue: { netAmount: this.defaultItemPrice, grossAmount: this.defaultItemPrice },
          },
        ],
      },
      {
        type: 'helper',
        name: 'haveProductInStock',
        arguments: [
          {
            sku: `#${productKey}.sku`,
            isNeverOutOfStock: '1',
            fkStock: DEFAULT_STOCK_ID,
            stockType: DEFAULT_STOCK_NAME,
          },
        ],
      },
    ];
  }
}
