// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CatalogPage from '../../pages/yves/catalog.page';
import FixturesResolver from '../../utils/fixtures-resolver.util';
import IteratorUtil from '../../utils/iterator.util';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S2',
  group: 'Product Search',
  metrics: ['S2_get_search'],
  thresholds: {
    S2_get_search: {
      smoke: ['avg<200'],
      load: ['avg<200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const fixture = FixturesResolver.resolveFixture('product', {
    productCount: testConfiguration.vus,
  });

  return fixture.getData();
}

export default function (data) {
  const product = IteratorUtil.iterateData({ fixtureName: 'product', data });

  group(testConfiguration.group, () => {
    const catalogPage = new CatalogPage();
    const response = catalogPage.search(product);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
