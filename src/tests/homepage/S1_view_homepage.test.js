// tags: smoke, load, soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import HomePage from '../../pages/yves/home.page';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S1',
  group: 'Homepage',
  metrics: ['S1_get_homepage'],
  thresholds: {
    S1_get_homepage: {
      smoke: ['avg<200'],
      load: ['avg<400'],
      soak: ['avg<400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export default function () {
  group(testConfiguration.group, () => {
    const homePage = new HomePage();
    const response = homePage.get();

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
