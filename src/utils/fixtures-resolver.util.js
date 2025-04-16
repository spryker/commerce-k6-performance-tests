import EnvironmentUtil from './environment.util';
import { CustomerFixture } from '../fixtures/customer.fixture';
import { CustomerStaticFixture } from '../static-fixtures/customer.static-fixture';
import { ProductStaticFixture } from '../static-fixtures/product.static-fixture';
import { FullProductFixture } from '../fixtures/full-product.fixture';

export default class FixturesResolver {
  /**
   * Available fixtures:
   * - customer
   * - product
   *
   * @param fixtureName
   * @param params
   *
   * @returns {*}
   */
  static resolveFixture(fixtureName, params = {}) {
    const isStaticFixture = EnvironmentUtil.getUseStaticFixtures();

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
      default:
        throw new Error(`Fixture "${fixtureName}" not found.`);
    }
  }
}
