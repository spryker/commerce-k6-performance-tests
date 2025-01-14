import { textSummary } from '../lib/external/k6-summary.js';

export function handleSummary(data) {
  const failedMetrics = getFailedMetrics(data);

  const summary = {
    stdout: textSummary(data),
  };

  const filePath = __ENV.SPRYKER_TEST_PATH;

  if (!filePath) {
    return summary;
  }

  if (Object.keys(failedMetrics).length > 0) {
    const testName = extractTestName(filePath);
    summary[`results/failed-thresholds/${testName}.txt`] = generateOutput(failedMetrics, testName);
  }

  return summary;
}

function getFailedMetrics(data) {
  const failedMetrics = {};

  for (let metricKey in data.metrics) {
    let metric = data.metrics[metricKey];
    if (!Object.prototype.hasOwnProperty.call(metric, 'thresholds')) {
      continue;
    }

    const failedThresholdKeys = getFailedThresholdKeys(metric.thresholds);

    if (failedThresholdKeys.length !== 0) {
      failedMetrics[metricKey] = {
        failedThresholds: failedThresholdKeys,
        values: metric.values,
      };
    }
  }

  return failedMetrics;
}

function getFailedThresholdKeys(thresholds) {
  const failedThresholdKeys = [];

  for (let thresholdKey in thresholds) {
    let threshold = thresholds[thresholdKey];
    if (Object.prototype.hasOwnProperty.call(threshold, 'ok') && threshold.ok === false) {
      failedThresholdKeys.push(thresholdKey);
    }
  }

  return failedThresholdKeys;
}

function extractTestName(filePath) {
  return filePath.split('/').pop().split('.').slice(0, -1).join('.');
}

function generateOutput(failedMetrics, testName) {
  let output = '';

  for (let metricKey in failedMetrics) {
    const metric = failedMetrics[metricKey];
    const values = metric.values;
    const failedThresholds = metric.failedThresholds.join(',');

    const valuesStr = Object.entries(values)
      .map(([key, value]) => `${key}: ${value}`)
      .join(',');

    output += `Test: ${testName}\n`;
    output += `Threshold: ${metricKey}\n`;
    output += `Failed metrics: ${failedThresholds}\n`;
    output += `Actual values: ${valuesStr}\n\n`;
  }

  return output;
}
