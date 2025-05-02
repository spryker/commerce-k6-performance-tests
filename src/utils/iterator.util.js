import { FullProductFixture } from '../fixtures/full-product.fixture';
import { CustomerFixture } from '../fixtures/customer.fixture';
import { CartFixture } from '../fixtures/cart.fixture';
import { ProductStaticFixture } from '../static-fixtures/product.static-fixture';
import { CustomerStaticFixture } from '../static-fixtures/customer.static-fixture';
import { CartStaticFixture } from '../static-fixtures/cart.static-fixture';
import { CmsPageStaticFixture } from '../static-fixtures/cms-page.static-fixture';
import { CmsPageFixture } from '../fixtures/cms-page.fixture';
import EnvironmentUtil from './environment.util';
import exec from 'k6/execution';

export default class IteratorUtil {
  static iterateData({ fixtureName, data, vus = null, iterations = null }) {
    const testType = EnvironmentUtil.getTestType();
    const isStaticFixtures = EnvironmentUtil.getUseStaticFixtures() && testType === 'soak';

    if (isStaticFixtures) {
      return this.iterateStaticFixture({ fixtureName, data });
    }

    if (vus === null && testType !== 'soak') {
      vus = exec.vu.idInTest;
    }

    if (iterations === null && testType !== 'soak') {
      iterations = exec.vu.iterationInScenario;
    }

    return this.iterateDynamicFixture({ fixtureName, data, vus, iterations });
  }

  static iterateStaticFixture({ fixtureName, data }) {
    switch (fixtureName) {
      case 'product':
        return ProductStaticFixture.iterateData(data);
      case 'customer':
        return CustomerStaticFixture.iterateData(data, exec.vu.idInTest);
      case 'cart':
        return CartStaticFixture.iterateData(data, exec.vu.idInTest);
      case 'cms-page':
        return CmsPageStaticFixture.iterateData(data);
      default:
        throw new Error(`Static fixture "${fixtureName}" not found.`);
    }
  }

  static iterateDynamicFixture({ fixtureName, data, vus, iterations }) {
    switch (fixtureName) {
      case 'product':
        return FullProductFixture.iterateData(data, vus);
      case 'customer':
        return CustomerFixture.iterateData(data, vus, iterations);
      case 'cart':
        return CartFixture.iterateData(data, vus, iterations);
      case 'cms-page':
        return CmsPageFixture.iterateData(data);
      default:
        throw new Error(`Fixture "${fixtureName}" not found.`);
    }
  }
}
