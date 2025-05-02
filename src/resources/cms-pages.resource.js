import AbstractResource from './abstract.resource';

export default class CmsPagesResource extends AbstractResource {
  constructor(bearerToken = null) {
    super(bearerToken);
  }

  all() {
    return this.getRequest('cms-pages');
  }

  get(cmsPageUuid) {
    return this.getRequest(`cms-pages/${cmsPageUuid}`);
  }
}
