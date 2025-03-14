import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import KSixError from '../../utils/k-six-error';

export default class CartPage extends AbstractPage {
  constructor(page) {
    super();
    this.page = page;
  }

  async navigate() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/cart`);
  }

  async getDurationTime() {
    await this.page.evaluate(() => window.performance.mark('page-visit'));
    const marks = await this.page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('mark')))
    );

    if (marks.length > 0) {
      return marks[0].startTime;
    }

    throw new KSixError('No marks found');
  }
}
