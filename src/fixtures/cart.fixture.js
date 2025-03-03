import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';
import EnvironmentUtil from '../utils/environment.util';

const LOCALE_ID = 66;
const LOCALE_NAME = 'en_US';
const DEFAULT_IMAGE_SMALL = 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg';
const DEFAULT_IMAGE_LARGE = 'https://images.icecat.biz/img/gallery/30691822_1486.jpg';
const DEFAULT_PASSWORD = 'change123';
const DEFAULT_STOCK_ID = 1;
const DEFAULT_STOCK_NAME = 'Warehouse1';
const DEFAULT_MERCHANT_REFERENCE = 'MER000008';

export class CartFixture extends AbstractFixture {
  constructor({ customerCount, cartCount = 1, itemCount = 1 }) {
    super();
    this.customerCount = customerCount;
    this.cartCount = cartCount;
    this.itemCount = itemCount;
    this.emptyCartCount = 0;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
  }

  getData(customerCount = this.customerCount, cartCount = this.cartCount) {
    this.customerCount = customerCount;
    this.cartCount = cartCount;

    const response = this.runDynamicFixture(this._getCustomersWithCartsPayload());

    const responseData = JSON.parse(response.body).data;
    const customers = responseData.filter((item) => /^customer\d+$/.test(item.attributes.key));

    return customers.map((customer) => {
      const carts = responseData
        .filter((item) => item.attributes.key.startsWith(`${customer.attributes.key}Cart`))
        .map((cart) => cart.attributes.data.uuid);

      return {
        customerEmail: customer.attributes.data.email,
        cartIds: carts,
      };
    });
  }

  static iterateData(data, vus = exec.vu.idInTest, iterations = exec.vu.iterationInScenario) {
    const customerIndex = (vus - 1) % data.length;
    const { customerEmail, cartIds } = data[customerIndex];
    const cartIndex = iterations % cartIds.length;

    return { customerEmail, idCart: cartIds[cartIndex] };
  }

  _getCustomersWithCartsPayload() {
    let companyPermissions = [];
    let baseOperations = [
      {
        type: 'transfer',
        name: 'LocaleTransfer',
        key: 'locale',
        arguments: { id_locale: LOCALE_ID, locale_name: LOCALE_NAME },
      },
      {
        type: 'transfer',
        name: 'StoreTransfer',
        key: 'store',
        arguments: { id_store: 1, name: 'DE' },
      },
      {
        type: 'array-object',
        key: 'stores',
        arguments: ['#store'],
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

    if (this.repositoryId === 'b2b-mp' || this.repositoryId === 'b2b') {
      companyPermissions = [
        {
          type: 'helper',
          name: 'haveCompany',
          key: 'company',
          arguments: [{ isActive: true, status: 'approved' }],
        },
        {
          type: 'helper',
          name: 'haveCompanyBusinessUnit',
          key: 'businessUnit',
          arguments: [{ fkCompany: '#company.id_company' }],
        },
        {
          type: 'helper',
          name: 'havePermissionByKey',
          key: 'permission1',
          arguments: ['AddCartItemPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'havePermissionByKey',
          key: 'permission2',
          arguments: ['ChangeCartItemPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'havePermissionByKey',
          key: 'permission3',
          arguments: ['RemoveCartItemPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'haveCompanyRoleWithPermissions',
          arguments: [
            { isDefault: true, fkCompany: '#company.id_company' },
            ['#permission1', '#permission2', '#permission3'],
          ],
        },
      ];
    }

    baseOperations.push(...companyPermissions);
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
    let productOffer = [];
    let product = [
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

    if (this.repositoryId === 'b2b-mp') {
      const productOfferKey = `productOffer${index + 1}`;
      productOffer = [
        {
          type: 'helper',
          name: 'haveProductOffer',
          key: productOfferKey,
          arguments: [
            {
              isActive: true,
              status: 'approved',
              idProductConcrete: `#${productKey}.id_product_concrete`,
              concreteSku: `#${productKey}.sku`,
              merchantReference: DEFAULT_MERCHANT_REFERENCE,
              stores: '#stores',
            },
          ],
        },
        {
          type: 'helper',
          name: 'haveProductOfferStock',
          arguments: [
            {
              idProductOffer: `#${productOfferKey}.id_product_offer`,
              productOfferReference: `#${productOfferKey}.product_offer_reference`,
              isNeverOutOfStock: true,
            },
            [{ idStock: DEFAULT_STOCK_ID }],
          ],
        },
      ];
    }

    product.push(...productOffer);

    return product;
  }

  _createCustomerPayload(index) {
    const customerKey = `customer${index + 1}`;
    let emptyQuotes = [];
    let companyUser = [];
    let quotes = Array.from({ length: this.cartCount }, (_, quoteIndex) => ({
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

    if (this.emptyCartCount) {
      emptyQuotes = Array.from({ length: this.emptyCartCount }, (_, emptyQuoteIndex) => ({
        type: 'helper',
        name: 'havePersistentQuote',
        key: `${customerKey}EmptyQuote${emptyQuoteIndex + 1}`,
        arguments: [
          {
            customer: `#${customerKey}`,
            items: [],
          },
        ],
      }));
    }

    quotes.push(...emptyQuotes);

    const customer = [
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
    ];

    if (this.repositoryId === 'b2b-mp' || this.repositoryId === 'b2b') {
      companyUser = [
        {
          type: 'helper',
          name: 'haveCompanyUser',
          key: `companyUser${customerKey}`,
          arguments: [
            {
              customer: `#${customerKey}`,
              fkCustomer: `#${customerKey}.id_customer`,
              fkCompany: '#company.id_company',
              fkCompanyBusinessUnit: '#businessUnit.id_company_business_unit',
            },
          ],
        },
      ];
    }

    customer.push(...companyUser);
    customer.push(...(quotes || []));

    return customer;
  }

  _generateItems() {
    return Array.from({ length: this.itemCount }, (_, i) => ({
      sku: `#product${i + 1}.sku`,
      abstractSku: `#product${i + 1}.abstract_sku`,
      quantity: 1,
      unitPrice: this.defaultItemPrice,
      productOfferReference: this.repositoryId === 'b2b-mp' ? `#productOffer${i + 1}.product_offer_reference` : null,
      merchantReference: this.repositoryId === 'b2b-mp' ? `#productOffer${i + 1}.merchant_reference` : null,
    }));
  }
}
