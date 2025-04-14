import { AbstractFixture } from './abstract.fixture';
import EnvironmentUtil from '../utils/environment.util';
import exec from 'k6/execution';
import { uuidv4 } from '../utils/uuid.util';

const DEFAULT_IMAGE_SMALL = 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg';
const DEFAULT_IMAGE_LARGE = 'https://images.icecat.biz/img/gallery/30691822_1486.jpg';
const DEFAULT_STOCK_ID = 1;
const DEFAULT_STOCK_NAME = 'Warehouse1';
const DEFAULT_MERCHANT_REFERENCE = 'MER000008';
const DEFAULT_STORE_ID = 1;
const DEFAULT_STORE_NAME = 'DE';
const DEFAULT_PARENT_CATEGORY_NODE = 0;
const DEFAULT_TAX_SET_ID = 1;
const DEFAULT_COLORS = ['Black', 'Blue', 'White'];
const DEFAULT_BRANDS = ['Adidas', 'Nike', 'Puma'];

export class CategoryFixture extends AbstractFixture {
  constructor({ categoryCount = 1, productCount = 1 }) {
    super();
    this.categoryCount = categoryCount;
    this.productCount = productCount;
    this.repositoryId = EnvironmentUtil.getRepositoryId();
    this.storeId = DEFAULT_STORE_ID;
  }

  getData() {
    const response = this.runDynamicFixture(this._getCategoriesPayload());
    const responseData = JSON.parse(response.body).data;
    return responseData
      .filter((item) => /^category\d+$/.test(item.attributes.key))
      .map((item) => {
        let category = item.attributes.data;
        category.url = this._buildCategoryUrl(category.localized_attributes[0].name);

        return category;
      });
  }

  static iterateData(data, vus = exec.vu.idInTest) {
    const categoryIndex = (vus - 1) % data.length;

    return data[categoryIndex];
  }

  _getCategoriesPayload() {
    this.productLabelKey = `productLabel${uuidv4().replace(/-/g, '')}`;
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
      {
        type: 'transfer',
        name: 'StoreTransfer',
        key: 'store',
        arguments: { id_store: this.storeId, name: DEFAULT_STORE_NAME },
      },
      {
        type: 'transfer',
        name: 'NodeTransfer',
        key: 'node',
        arguments: { fkParentCategoryNode: DEFAULT_PARENT_CATEGORY_NODE },
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
        name: 'haveProductLabel',
        key: this.productLabelKey,
        arguments: [
          {
            storeRelation: '#storeRelation',
          },
          {
            name: 'KSixTestLabel',
            frontEndReference: 'KSixTestLabel',
          },
        ],
      },
    ];

    const categories = Array.from({ length: this.categoryCount }, (_, i) => this._createCategoryPayload(i)).flat();
    const products = Array.from({ length: this.productCount }, (_, i) => this._createProductPayload(i)).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...baseOperations, ...categories, ...products],
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
        arguments: [this._getProductLocalizedAttributes(), { idTaxSet: DEFAULT_TAX_SET_ID }],
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

    for (let i = 0; i < this.categoryCount; i++) {
      product.push({
        type: 'helper',
        name: 'haveProductCategoryForCategory',
        arguments: [
          `#category${i + 1}.id_category`,
          {
            fkProductAbstract: `#${productKey}.fk_product_abstract`,
          },
        ],
      });
    }

    product.push({
      type: 'helper',
      name: 'haveProductLabelToAbstractProductRelation',
      arguments: {
        idProductLabel: `#${this.productLabelKey}.id_product_label`,
        idProductAbstract: `#${productKey}.fk_product_abstract`,
      },
    });

    return product;
  }

  _createCategoryPayload(index) {
    const categoryKey = `category${index + 1}`;

    return [
      {
        type: 'helper',
        name: 'haveLocalizedCategory',
        key: categoryKey,
        arguments: [
          {
            parentCategoryNode: '#node',
          },
        ],
      },
      {
        type: 'helper',
        name: 'haveCategoryStoreRelation',
        arguments: {
          idCategory: `#${categoryKey}.id_category`,
          idStore: '#store.id_store',
        },
      },
    ];
  }

  _getProductLocalizedAttributes() {
    return {
      attributes: this._generateAttributesValue(),
    };
  }

  _generateAttributesValue() {
    const colors = DEFAULT_COLORS;
    const brands = DEFAULT_BRANDS;

    const color = colors[Math.floor(Math.random() * colors.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];

    return { color: color, brand: brand };
  }

  _buildCategoryUrl(categoryName) {
    return `en/${categoryName.replace(/\s+/g, '-').toLowerCase()}`;
  }
}
