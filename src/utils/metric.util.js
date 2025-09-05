import { Trend, Counter } from 'k6/metrics';
import EnvironmentUtil from './environment.util';

const errorCounter = new Counter('errors');

export function createMetrics(testConfiguration) {
  const metrics = {};
  const metricThresholds = {};

  testConfiguration.metrics.forEach((metricName) => {
    metrics[metricName] = new Trend(metricName);
    const thresholds = testConfiguration.thresholds[metricName];
    metricThresholds[metricName] = thresholds[EnvironmentUtil.getTestType()] || thresholds.smoke;
  });

  return { metrics, metricThresholds };
}

export function addErrorToCounter(isPassedCheck) {
  if (!isPassedCheck) {
    errorCounter.add(1);
  }
}
