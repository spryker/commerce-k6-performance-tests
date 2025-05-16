import CmsPagesResource from "../../resources/cms-pages.resource";
import RandomUtil from "../../utils/random.util";

export class CmsPageFixture {
  constructor({ cmsPagesCount = 1 }) {
    this.cmsPagesCount = cmsPagesCount;
  }

  getData() {
    const cmsPagesResource = new CmsPagesResource();
    const response = cmsPagesResource.all();

    if (response.status !== 200) {
      throw new Error(`Failed to fetch CMS pages: ${response.body}`);
    }

    const cmsPages = JSON.parse(response.body).data;

    return cmsPages.map((cmsPage) => {
      return {
        uuid: cmsPage.id,
      };
    });
  }

  iterateData(data) {
    return RandomUtil.getRandomItem(data);
  }
}
