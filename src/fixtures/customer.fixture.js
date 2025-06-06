import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';
import EnvironmentUtil from '../utils/environment.util';

export class CustomerFixture extends AbstractFixture {
  constructor({ customerCount, itemCount = 1, defaultItemPrice = 10000 }) {
    super();
    this.customerCount = customerCount;
    this.itemCount = itemCount;
    this.defaultItemPrice = defaultItemPrice;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
  }

  static createFixture(params = {}) {
    if (AbstractFixture.shouldUseStaticFixtures()) {
      const { CustomerFixture: StaticCustomerFixture } = require('./static/customer.fixture');

      return new StaticCustomerFixture(params);
    }

    return new CustomerFixture(params);
  }

  getData(customerCount = this.customerCount) {
    this.customerCount = customerCount;

    const response = this.runDynamicFixture(this._getCustomersWithQuotesPayload());

    const responseData = JSON.parse(response.body).data;
    const customers = responseData.filter((item) => /^customer\d+$/.test(item.attributes.key));

    return customers.map((customer) => {
      const products = responseData
        .filter((item) => item.attributes.key.startsWith('productKey'))
        .map((item) => {
          const { fk_product_abstract, id_product_concrete, sku, abstract_sku } = item.attributes.data;
          const localized = item.attributes.data.localized_attributes[0] || {};
          const url = this.buildProductUrl(item.attributes.data.localeName, localized.name, fk_product_abstract);

          let productData = {
            id: id_product_concrete,
            sku,
            abstractSku: abstract_sku,
            abstractId: fk_product_abstract,
            url,
          };

          if (this.repositoryId === 'b2b-mp') {
            const productOfferKey = item.attributes.key.replace('productKey', 'productOffer');
            const productOffer = responseData.filter((item) => item.attributes.key.startsWith(productOfferKey));
            productData.productOfferReference = productOffer[0].attributes.data.product_offer_reference;
          }

          return productData;
        });

      return {
        customerEmail: customer.attributes.data.email,
        products: products,
      };
    });
  }

  iterateData(data, vus = exec.vu.idInTest) {
    const customerIndex = (vus - 1) % data.length;
    const { customerEmail, products } = data[customerIndex];

    return {
      customerEmail,
      products,
    };
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
    const productKey = `productKey${index + 1}`;
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
              merchantReference: this.getSprykerMerchantReference(),
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
    let companyUser = [];

    const customer = [
      {
        type: 'helper',
        name: 'haveCustomer',
        key: customerKey,
        arguments: [{ locale: '#locale', password: AbstractFixture.DEFAULT_PASSWORD }],
      },
      {
        type: 'helper',
        name: 'haveCustomerAddress',
        arguments: [{ email: `#${customerKey}.email` }],
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

    return customer;
  }

  buildProductUrl(localeName, name, abstractId) {
    const localePrefix = localeName
      ? `${localeName.toLowerCase().replace('_', '-')}`
      : AbstractFixture.DEFAULT_PRODUCT_URL_PREFIX;

    return `${localePrefix}/${name.replace('.', '').replace('#', '').replace(' ', '-').toLowerCase()}-${abstractId}`;
  }
}
