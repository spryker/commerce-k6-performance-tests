import { AbstractFixture } from './abstract.fixture';

const LOCALE_ID = 66;
const LOCALE_NAME = 'en_US';
const DEFAULT_IMAGE_SMALL = 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg';
const DEFAULT_IMAGE_LARGE = 'https://images.icecat.biz/img/gallery/30691822_1486.jpg';
const DEFAULT_PASSWORD = 'change123';
const DEFAULT_STOCK_ID = 1;
const DEFAULT_STOCK_NAME = 'Warehouse1';

export class CheckoutFixture extends AbstractFixture {
  constructor({ customerCount, cartCount = 1, itemCount = 10, defaultItemPrice = 1000 }) {
    super();
    this.customerCount = customerCount;
    this.cartCount = cartCount;
    this.itemCount = itemCount;
    this.defaultItemPrice = defaultItemPrice;
  }

  getData(customerCount = this.customerCount, cartCount = this.cartCount) {
    this.customerCount = customerCount;
    this.cartCount = cartCount;

    const response = this.runDynamicFixture(this._getCustomersWithQuotesPayload());

    const responseData = JSON.parse(response.body).data;
    const customers = responseData.filter((item) => /^customer\d+$/.test(item.attributes.key));

    return customers.map((customer) => {
      const quotes = responseData
        .filter((item) => item.attributes.key.startsWith(`${customer.attributes.key}Quote`))
        .map((quote) => quote.attributes.data.uuid);

      return {
        customerEmail: customer.attributes.data.email,
        quoteIds: quotes,
      };
    });
  }

  static iterateData(data, vus = __VU, iterations = __ITER) {
    const customerIndex = (vus - 1) % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = iterations % quoteIds.length;

    return { customerEmail, idCart: quoteIds[quoteIndex] };
  }

  _getCustomersWithQuotesPayload() {
    const baseOperations = [
      {
        type: 'transfer',
        name: 'LocaleTransfer',
        key: 'locale',
        arguments: { id_locale: LOCALE_ID, locale_name: LOCALE_NAME },
      },
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

    const products = Array.from({ length: this.itemCount }, (_, i) => this._createProductPayload(i)).flat();
    const customers = Array.from({ length: this.customerCount }, (_, i) => this._createCustomerPayload(i)).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...baseOperations, ...products, ...customers],
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

  _createCustomerPayload(index) {
    const customerKey = `customer${index + 1}`;
    const quotes = Array.from({ length: this.cartCount }, (_, quoteIndex) => ({
      type: 'helper',
      name: 'havePersistentQuote',
      key: `${customerKey}Quote${quoteIndex + 1}`,
      arguments: [
        {
          customer: `#${customerKey}`,
          items: this._generateItems(),
        },
      ],
    }));

    return [
      {
        type: 'helper',
        name: 'haveCustomer',
        key: customerKey,
        arguments: [{ locale: '#locale', password: DEFAULT_PASSWORD }],
      },
      {
        type: 'helper',
        name: 'confirmCustomer',
        key: `confirmed${customerKey}`,
        arguments: [`#${customerKey}`],
      },
      ...quotes,
    ];
  }

  _generateItems() {
    return Array.from({ length: this.itemCount }, (_, i) => ({
      sku: `#product${i + 1}.sku`,
      abstractSku: `#product${i + 1}.abstract_sku`,
      quantity: 1,
      unitPrice: this.defaultItemPrice,
    }));
  }
}
