import { AbstractFixture } from './abstract.fixture';
import EnvironmentUtil from '../utils/environment.util';
import exec from 'k6/execution';
import RandomUtil from '../utils/random.util';

export class FullProductFixture extends AbstractFixture {
  constructor({ productCount = 1, additionalConcreteCount = 0, includes = {} }) {
    super();
    this.productCount = productCount;
    this.additionalConcreteCount = additionalConcreteCount;
    this.includes = includes;
    this.storeId = AbstractFixture.DEFAULT_STORE_ID;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
  }

  static createFixture(params = {}) {
    if (AbstractFixture.shouldUseStaticFixtures()) {
      const { FullProductFixture: StaticFullProductFixture } = require('./static/full-product.fixture');

      return new StaticFullProductFixture(params);
    }

    return new FullProductFixture(params);
  }

  getData() {
    const response = this.runDynamicFixture(this._getProductsPayload());
    const responseData = JSON.parse(response.body).data;
    return responseData
      .filter((item) => /^product\d+$/.test(item.attributes.key))
      .map((item) => {
        const { id_product_concrete, sku, fk_product_abstract, is_active, abstract_sku, localized_attributes } =
          item.attributes.data;
        const localized = localized_attributes[0] || {};
        const url = this.buildProductUrl(localized.localeName, localized.name, fk_product_abstract);

        return {
          id: id_product_concrete,
          sku,
          abstractSku: abstract_sku,
          abstractId: fk_product_abstract,
          isActive: is_active === 'true',
          name: localized.name || null,
          description: localized.description || null,
          locale: localized.locale?.locale_name || null,
          searchable: localized.is_searchable === '1',
          url: url,
        };
      });
  }

  iterateData(data, vus = exec.vu.idInTest) {
    if (EnvironmentUtil.getTestType() === 'soak') {
      return RandomUtil.getRandomItem(data);
    }

    const productIndex = (vus - 1) % data.length;

    return data[productIndex];
  }

  _getProductsPayload() {
    const baseOperations = [
      {
        type: 'transfer',
        name: 'ProductImageTransfer',
        key: 'productImage',
        arguments: {
          externalUrlSmall: AbstractFixture.DEFAULT_IMAGE_SMALL,
          externalUrlLarge: AbstractFixture.DEFAULT_IMAGE_LARGE,
        },
      },
      {
        type: 'transfer',
        name: 'StoreTransfer',
        key: 'store',
        arguments: {
          id_store: this.storeId,
          name: AbstractFixture.DEFAULT_STORE_NAME,
          defaultCurrencyIsoCode: AbstractFixture.DEFAULT_CURRENCY_CODE,
        },
      },
      {
        type: 'transfer',
        name: 'StoreRelationTransfer',
        key: 'storeRelation',
        arguments: { idStores: [this.storeId] },
      },
      {
        type: 'array-object',
        key: 'stores',
        arguments: ['#store'],
      },
      {
        type: 'helper',
        name: 'haveLocale',
        key: 'locale',
        arguments: [
          {
            localeName: AbstractFixture.DEFAULT_LOCALE,
          },
        ],
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

    if ('options' in this.includes) {
      this._addProductOptionsPayload(product, productKey);
    }

    if ('reviews' in this.includes) {
      this._addProductReviewsPayload(product, index, productKey);
    }

    if ('categories' in this.includes) {
      this._addProductCategoriesPayload(product, index, productKey);
    }

    if ('labels' in this.includes) {
      this._addProductLabelsPayload(product, index, productKey);
    }

    if (this.additionalConcreteCount > 0) {
      this._addAdditionalConcreteProductsPayload(product, index, productKey);
    }

    return product;
  }

  _addProductOptionsPayload(product, productKey) {
    let productOptions = {
      type: 'helper',
      name: 'haveProductOptionValueForAbstractProduct',
      arguments: {
        productAbstractSku: `#${productKey}.abstract_sku`,
        storeTransfer: '#store',
      },
    };

    for (let i = 0; i < this.includes.options; i++) {
      product.push(productOptions);
    }
  }

  _addProductCategoriesPayload(product, index, productKey) {
    for (let i = 0; i < this.includes.categories; i++) {
      let productCategory = [
        {
          type: 'helper',
          name: 'haveLocalizedCategory',
          key: `category${index + 1}`,
          arguments: [],
        },
        {
          type: 'helper',
          name: 'haveProductCategoryForCategory',
          arguments: [
            `#category${index + 1}.id_category`,
            {
              fkProductAbstract: `#${productKey}.fk_product_abstract`,
            },
          ],
        },
      ];

      product.push(...productCategory);
    }
  }

  _addProductLabelsPayload(product, index, productKey) {
    for (let i = 0; i < this.includes.labels; i++) {
      let productLabelKey = `productLabel${index}${i + 1}`;
      let productLabels = [
        {
          type: 'helper',
          name: 'haveProductLabel',
          key: productLabelKey,
          arguments: [
            {
              storeRelation: '#storeRelation',
            },
          ],
        },
        {
          type: 'helper',
          name: 'haveProductLabelToAbstractProductRelation',
          arguments: {
            idProductLabel: `#${productLabelKey}.id_product_label`,
            idProductAbstract: `#${productKey}.fk_product_abstract`,
          },
        },
      ];

      product.push(...productLabels);
    }
  }

  _addProductReviewsPayload(product, index, productKey) {
    let customer = {
      type: 'helper',
      name: 'haveCustomer',
      key: `customer${index + 1}`,
      arguments: [
        {
          locale: '#locale',
        },
      ],
    };

    product.push(customer);

    let productReviews = {
      type: 'helper',
      name: 'haveApprovedCustomerReviewForAbstractProduct',
      arguments: {
        idLocale: '#locale.id_locale',
        customerReference: `#customer${index + 1}.customer_reference`,
        idProductAbstract: `#${productKey}.fk_product_abstract`,
        productReviewStatus: 'approved',
      },
    };

    for (let i = 0; i < this.includes.reviews; i++) {
      product.push(productReviews);
    }
  }

  _addAdditionalConcreteProductsPayload(product, index, productKey) {
    for (let i = 0; i < this.additionalConcreteCount; i++) {
      const additionalConcreteProductKey = `additionalConcreteProduct${index + i + 1}`;
      let additionalConcreteProduct = [
        {
          type: 'helper',
          name: 'haveProductConcreteWithLocalizedAttributes',
          key: additionalConcreteProductKey,
          arguments: [
            {
              fkProductAbstract: `#${productKey}.fk_product_abstract`,
              abstractSku: `#${productKey}.abstract_sku`,
            },
          ],
        },
      ];

      product.push(...additionalConcreteProduct);
    }
  }

  buildProductUrl(localeName, name, abstractId) {
    const localePrefix = localeName
      ? `${localeName.toLowerCase().replace('_', '-')}`
      : AbstractFixture.DEFAULT_PRODUCT_URL_PREFIX;

    return `${localePrefix}/${name.replace('.', '').replace('#', '').replace(' ', '-').toLowerCase()}-${abstractId}`;
  }
}
