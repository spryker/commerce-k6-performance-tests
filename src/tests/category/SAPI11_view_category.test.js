// tags: smoke, load, soak, category, SAPI
import { group, sleep } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CategoryFixture } from '../../fixtures/category.fixture';
import CategoryNodesResource from '../../resources/category-nodes.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI11',
  group: 'Category',
  metrics: ['SAPI11_get_category_nodes'],
  thresholds: {
    SAPI11_get_category_nodes: {
      smoke: ['avg<100'],
      load: ['avg<200'],
      soak: ['avg<200'],
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
  const data = fixture.getData();
  sleep(5);

  return data;
}

export default function (data) {
  const category = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const categoryNodesResource = new CategoryNodesResource();
    const response = categoryNodesResource.get(category.category_node.id_category_node);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
