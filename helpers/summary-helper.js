import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export class SummaryHelper {
    static handleSummary(data, environment, testId) {
        const failedMetrics = {};

        for(let metricKey in data.metrics) {
            let metric = data.metrics[metricKey];
            if (!Object.prototype.hasOwnProperty.call(metric, 'thresholds')) {
                continue;
            }

            const failedThresholdKeys = [];
            for(let thresholdKey in metric.thresholds) {
                let threshold = metric.thresholds[thresholdKey];
                if (Object.prototype.hasOwnProperty.call(threshold, 'ok') && threshold.ok === false) {
                    failedThresholdKeys.push(thresholdKey);
                }
            }

            if (failedThresholdKeys.length !== 0) {
                failedMetrics[metricKey] = {};
                failedMetrics[metricKey].failedThresholds = failedThresholdKeys;
                failedMetrics[metricKey].values = metric.values;
            }
        }

        const summary = {
            'stdout': textSummary(data),
        };

        if (Object.keys(failedMetrics).length > 0) {
            let output = '';

            for (let metricKey in failedMetrics) {
                const metric = failedMetrics[metricKey];
                const values = metric.values;
                const failedThresholds = metric.failedThresholds.join(',');

                const valuesStr = Object.entries(values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(',');

                output += `Test: ${testId}, ${environment}\n`;
                output += `Threshold: ${metricKey}\n`;
                output += `Failed metrics: ${failedThresholds}\n`;
                output += `Actual values: ${valuesStr}\n\n`;
            }

            summary[`results/failed-thresholds/${environment}_${testId}.txt`] = output;
        }

        return summary;
    }
}
