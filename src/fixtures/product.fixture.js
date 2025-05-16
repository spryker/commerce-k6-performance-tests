import { AbstractFixture } from './abstract.fixture';
import EnvironmentUtil from '../utils/environment.util';
import exec from 'k6/execution';

export class ProductFixture extends AbstractFixture {
  constructor({ productCount = 1 }) {
    super();
    this.productCount = productCount;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
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
        };
      });
  }

  iterateData(data, vus = exec.vu.idInTest) {
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
        arguments: { id_store: AbstractFixture.DEFAULT_STORE_ID, name: AbstractFixture.DEFAULT_STORE_NAME },
      },
      {
        type: 'array-object',
        key: 'stores',
        arguments: ['#store'],
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

    return product;
  }
}
