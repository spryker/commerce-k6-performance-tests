// tags: smoke, load, soak, category, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import CategoryTreesResource from '../../resources/category-trees.resource';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI10',
  group: 'Category',
  metrics: ['SAPI10_get_category_trees'],
  thresholds: {
    SAPI10_get_category_trees: {
      smoke: ['avg<350'],
      load: ['avg<200'],
      soak: ['avg<200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export default function () {
  group(testConfiguration.group, () => {
    const categoryTreesResource = new CategoryTreesResource();
    const response = categoryTreesResource.all();

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
