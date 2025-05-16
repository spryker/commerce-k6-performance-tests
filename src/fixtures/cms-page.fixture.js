import { AbstractFixture } from './abstract.fixture';
import RandomUtil from '../utils/random.util';

export class CmsPageFixture extends AbstractFixture {

  constructor({ cmsPagesCount = 1 }) {
    super();
    this.cmsPagesCount = cmsPagesCount;
  }

  static createFixture(params = {}) {
    if (AbstractFixture.shouldUseStaticFixtures()) {
      const { CmsPageFixture: StaticCmsPageFixture } = require('./static/cms-page.fixture');
      return new StaticCmsPageFixture(params);
    }
    return new CmsPageFixture(params);
  }

  getData() {
    const response = this.runDynamicFixture(this._getCmsPagesPayload());

    const responseData = JSON.parse(response.body).data;
    const cmsPages = responseData.filter((item) => /^cms-page-uuid\d+$/.test(item.attributes.key));

    return cmsPages.map((cmsPage) => {
      return {
        uuid: cmsPage.attributes.data.uuid,
      };
    });
  }

  static iterateData(data) {
    return RandomUtil.getRandomItem(data);
  }

  _getCmsPagesPayload() {
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
    ];

    const cmsPages = Array.from({ length: this.cmsPagesCount }, (_, i) => this._createCmsPagePayload(i)).flat();

    return JSON.stringify({
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          synchronize: true,
          operations: [...baseOperations, ...cmsPages],
        },
      },
    });
  }

  _createCmsPagePayload(index) {
    const cmsPageKey = `cms-page${index + 1}`;
    const cmsPageUuidKey = `cms-page-uuid${index + 1}`;
    return [
      {
        type: 'helper',
        name: 'havePublishedCmsPage',
        key: cmsPageKey,
        arguments: [
          {
            isActive: true,
            isSearchable: true,
            fkTemplate: 1,
            fkLocale: '#locale.id_locale',
            localeName: '#locale.locale_name',
            storeRelation: { idStores: ['#store.id_store'] },
          },
        ],
      },
      {
        type: 'helper',
        name: 'getCmsPageUuidByIdCmsPage',
        key: cmsPageUuidKey,
        arguments: { idCmsPage: `#${cmsPageKey}.fk_page` },
      },
    ];
  }
}
