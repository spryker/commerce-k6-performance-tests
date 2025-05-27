// tags: smoke, load, category, S
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CategoryFixture } from '../../fixtures/category.fixture';
import CategoryPage from '../../pages/yves/category.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S25',
  group: 'Category',
  metrics: ['S25_get_category'],
  thresholds: {
    S25_get_category: {
      smoke: ['avg<300'],
      load: ['avg<600'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CategoryFixture({
  categoryCount: 1,
  productCount: 100,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const category = fixture.iterateData(data);

  group('Category Filter Products', () => {
    const categoryPage = new CategoryPage();
    const response = categoryPage.get(category.url, {
      'label[]': 'KSixTestLabel',
      'color[]': 'Black',
      brand: 'Nike',
      ipp: 36,
    });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
