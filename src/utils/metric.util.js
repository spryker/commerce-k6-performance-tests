import { Trend } from 'k6/metrics';
import EnvironmentUtil from './environment.util.js';

export function createMetrics(testConfiguration) {
  const metrics = {};
  const metricThresholds = {};

  testConfiguration.metrics.forEach((metricName) => {
    metrics[metricName] = new Trend(metricName);
    const thresholds = testConfiguration.thresholds[metricName];
    metricThresholds[metricName] = thresholds[EnvironmentUtil.getRepositoryType()] || thresholds.smoke;
  });

  return { metrics, metricThresholds };
}
