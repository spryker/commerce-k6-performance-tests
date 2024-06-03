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
            failedMetrics.environment = environment;
            failedMetrics.testId = testId;

            summary[`results/failed-thresholds/${environment}_${testId}.json`] = JSON.stringify(failedMetrics);
        }

        return summary;
    }
}
