import { AbstractFixture } from './abstract.fixture';
import EnvironmentUtil from '../utils/environment.util';
import exec from 'k6/execution';

export class CheckoutFixture extends AbstractFixture {
  constructor({ customerCount, cartCount = 1, itemCount = 10, defaultItemPrice = 1000, forceMarketplace = false }) {
    super();
    this.customerCount = customerCount;
    this.cartCount = cartCount;
    this.itemCount = itemCount;
    this.defaultItemPrice = defaultItemPrice;
    this.emptyCartCount = 0;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
    this.isMarketplace = this.repositoryId === 'b2b-mp' || forceMarketplace;
  }

  getData(customerCount = this.customerCount, cartCount = this.cartCount, emptyCartCount = this.emptyCartCount) {
    this.customerCount = customerCount;
    this.cartCount = cartCount;
    this.emptyCartCount = emptyCartCount;

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

  static iterateData(data, vus = exec.vu.idInTest, iterations = exec.vu.iterationInScenario) {
    const customerIndex = (vus - 1) % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = iterations % quoteIds.length;

    return { customerEmail, idCart: quoteIds[quoteIndex] };
  }

  _getCustomersWithQuotesPayload() {
    let companyPermissions = [];
    let baseOperations = [
      {
        type: 'transfer',
        name: 'LocaleTransfer',
        key: 'locale',
        arguments: { id_locale: AbstractFixture.DEFAULT_LOCALE_ID, locale_name: AbstractFixture.DEFAULT_LOCALE_NAME },
      },
      {
        type: 'transfer',
        name: 'StoreTransfer',
        key: 'store',
        arguments: { id_store: AbstractFixture.DEFAULT_STORE_ID, name: AbstractFixture.DEFAULT_STORE_NAME },
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
          externalUrlSmall: AbstractFixture.DEFAULT_IMAGE_SMALL,
          externalUrlLarge: AbstractFixture.DEFAULT_IMAGE_LARGE,
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
          name: 'havePermissionByKey',
          key: 'permission4',
          arguments: ['PlaceOrderWithAmountUpToPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'havePermissionByKey',
          key: 'permission5',
          arguments: ['PlaceOrderPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'havePermissionByKey',
          key: 'permission6',
          arguments: ['SeeBusinessUnitOrdersPermissionPlugin'],
        },
        {
          type: 'helper',
          name: 'haveCompanyRoleWithPermissions',
          arguments: [
            { isDefault: true, fkCompany: '#company.id_company' },
            ['#permission1', '#permission2', '#permission3', '#permission4', '#permission5', '#permission6'],
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
        arguments: [{}, { idTaxSet: AbstractFixture.DEFAULT_TAX_SET_ID }],
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
            fkStock: AbstractFixture.DEFAULT_STOCK_ID,
            stockType: AbstractFixture.DEFAULT_STOCK_NAME,
          },
        ],
      },
    ];

    if (this.isMarketplace) {
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
              merchantReference: AbstractFixture.DEFAULT_MERCHANT_REFERENCE,
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
            [{ idStock: AbstractFixture.DEFAULT_STOCK_ID }],
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
        arguments: [{ locale: '#locale', password: AbstractFixture.DEFAULT_PASSWORD }],
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
      idProductAbstract: `#product${i + 1}.fk_product_abstract`,
      quantity: 1,
      unitPrice: this.defaultItemPrice,
      unitGrossPrice: this.defaultItemPrice,
      productOfferReference: this.isMarketplace ? `#productOffer${i + 1}.product_offer_reference` : null,
      merchantReference: this.isMarketplace ? `#productOffer${i + 1}.merchant_reference` : null,
    }));
  }
}

