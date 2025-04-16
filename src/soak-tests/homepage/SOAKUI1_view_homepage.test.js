import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import EnvironmentUtil from '../../utils/environment.util';
import HomePage from '../../pages/yves/home.page';
import { sleep } from 'k6';
import { createMetrics } from '../../utils/metric.util';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultSoakTestConfiguration(),
  id: 'SOAKUI1',
  group: 'Homepage',
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  metrics: ['SOAKUI1_get_homepage'],
  thresholds: {
    SOAKUI1_get_homepage: {
      duration: ['avg<200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadSoakOptions(testConfiguration, metricThresholds);

export default function () {
  group(testConfiguration.group, () => {
    const homePage = new HomePage();
    const response = homePage.get();

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);

    sleep(1);
  });
}
