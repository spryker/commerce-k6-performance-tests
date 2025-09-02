import { AbstractFixture } from './abstract.fixture';
import exec from 'k6/execution';
import EnvironmentUtil from '../utils/environment.util';

export class ShoppingListFixture extends AbstractFixture {
  constructor({ customerCount, shoppingListCount = 1, itemCount = 1, defaultItemPrice = 1000 }) {
    super();
    this.customerCount = customerCount;
    this.shoppingListCount = shoppingListCount;
    this.itemCount = itemCount;
    this.defaultItemPrice = defaultItemPrice;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
  }

  getData(customerCount = this.customerCount, shoppingListCount = this.shoppingListCount) {
    this.customerCount = customerCount;
    this.shoppingListCount = shoppingListCount;

    const response = this.runDynamicFixture(this._getCustomersWithShoppingListsPayload());

    const responseData = JSON.parse(response.body).data;
    const customers = responseData.filter((item) => /^customer\d+$/.test(item.attributes.key));

    return customers.map((customer) => {
      const shoppingLists = responseData
        .filter((item) => item.attributes.key.startsWith(`${customer.attributes.key}ShoppingList`))
        .map((shoppingList) => shoppingList.attributes.data.uuid);

      const productSkus = responseData
        .filter((item) => item.attributes.key.startsWith('productKey'))
        .map((product) => product.attributes.data.sku);

      return {
        customerEmail: customer.attributes.data.email,
        shoppingListIds: shoppingLists,
        productSkus: productSkus,
      };
    });
  }

  iterateData(data, vus = exec.vu.idInTest, iterations = exec.vu.iterationInScenario) {
    if (EnvironmentUtil.getTestType() === 'soak') {
      const { customerEmail, shoppingListIds, productSkus } = data[exec.vu.idInTest - 1];

      return {
        customerEmail,
        idShoppingList: shoppingListIds[0],
        productSku: productSkus[0],
      };
    }

    const customerIndex = (vus - 1) % data.length;
    const { customerEmail, shoppingListIds, productSkus } = data[customerIndex];
    const shoppingListIndex = iterations % shoppingListIds.length;

    return {
      customerEmail,
      idShoppingList: shoppingListIds[shoppingListIndex],
      productSkus: productSkus,
    };
  }

  _getCustomersWithShoppingListsPayload() {
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

    let companyPermissions = [
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
    ];

    if (this.repositoryId === 'b2b-mp' || this.repositoryId === 'b2b') {
      companyPermissions.push(
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
        }
      );
    }

    baseOperations.push(...companyPermissions);
    const products = Array.from({ length: this.itemCount }, (_, i) => this._createProductPayload(i)).flat();
    const customers = Array.from({ length: this.customerCount }, (_, i) => this._createCustomerPayload(i)).flat();

    let cliCommands = [];
    cliCommands.push({
      type: 'cli-command',
      name: 'vendor/bin/console publish:trigger-events -r company_user',
    });

    cliCommands.push({
      type: 'cli-command',
      name: 'vendor/bin/console q:w:s --stop-when-empty',
    });

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...baseOperations, ...products, ...customers, ...cliCommands],
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
    let quotes = Array.from({ length: this.shoppingListCount }, (_, quoteIndex) => ({
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

    let shoppingLists = Array.from({ length: this.shoppingListCount }, (_, quoteIndex) => ({
      type: 'helper',
      name: 'haveShoppingListFromQuote',
      key: `${customerKey}ShoppingList${quoteIndex + 1}`,
      arguments: [`#${customerKey}Quote${quoteIndex + 1}.id_quote`, `#${customerKey}`],
    }));

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

    let companyUser = [
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

    customer.push(...companyUser);
    customer.push(...(quotes || []));
    customer.push(...(shoppingLists || []));

    return customer;
  }

  _generateItems() {
    return Array.from({ length: this.itemCount }, (_, i) => ({
      sku: `#productKey${i + 1}.sku`,
      abstractSku: `#productKey${i + 1}.abstract_sku`,
      idProductAbstract: `#productKey${i + 1}.fk_product_abstract`,
      quantity: 1,
      unitPrice: this.defaultItemPrice,
      unitGrossPrice: this.defaultItemPrice,
      productOfferReference: this.repositoryId === 'b2b-mp' ? `#productOffer${i + 1}.product_offer_reference` : null,
      merchantReference: this.repositoryId === 'b2b-mp' ? `#productOffer${i + 1}.merchant_reference` : null,
    }));
  }
}
