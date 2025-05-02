import EnvironmentUtil from './environment.util';
import { CustomerFixture } from '../fixtures/customer.fixture';
import { CustomerStaticFixture } from '../static-fixtures/customer.static-fixture';
import { ProductStaticFixture } from '../static-fixtures/product.static-fixture';
import { FullProductFixture } from '../fixtures/full-product.fixture';
import { CartFixture } from '../fixtures/cart.fixture';
import { CartStaticFixture } from '../static-fixtures/cart.static-fixture';
import { CmsPageFixture } from '../fixtures/cms-page.fixture';
import { CmsPageStaticFixture } from '../static-fixtures/cms-page.static-fixture';

export default class FixturesResolver {
  /**
   * Available fixtures:
   * - customer
   * - product
   * - cart
   *
   * @param fixtureName
   * @param params
   *
   * @returns {*}
   */
  static resolveFixture(fixtureName, params = {}) {
    const isStaticFixture = EnvironmentUtil.getUseStaticFixtures() && EnvironmentUtil.getTestType() === 'soak';

    if (isStaticFixture) {
      return this.getStaticFixture(fixtureName, params);
    }

    return this.getDynamicFixture(fixtureName, params);
  }

  static getStaticFixture(fixtureName, params) {
    switch (fixtureName) {
      case 'customer':
        return new CustomerStaticFixture(params);
      case 'product':
        return new ProductStaticFixture(params);
      case 'cart':
        return new CartStaticFixture(params);
      case 'cms-page':
        return new CmsPageStaticFixture(params);
      default:
        throw new Error(`Static fixture "${fixtureName}" not found.`);
    }
  }

  static getDynamicFixture(fixtureName, params) {
    switch (fixtureName) {
      case 'customer':
        return new CustomerFixture(params);
      case 'product':
        return new FullProductFixture(params);
      case 'cart':
        return new CartFixture(params);
      case 'cms-page':
        return new CmsPageFixture(params);
      default:
        throw new Error(`Fixture "${fixtureName}" not found.`);
    }
  }
}
