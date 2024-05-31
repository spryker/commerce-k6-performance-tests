import { Trend, Rate, Counter } from 'k6/metrics';
import { toCamelCase } from '../../lib/utils.js';

/*
metricsCodes = [
    {
        key: stripe_page_loading_time,
        types: ['trend', 'rate'],
        isTime: true,
        thresholds: {
            trend: ['p(95)<60000'],
            rate: ['rate==1']
        }
    },
    {
        key: invoice_page_loading_time,
        types: ['trend', 'rate'],
        isTime: true,
        thresholds: {
            trend: ['p(95)<60000'],
            rate: ['rate==1']
        }
    }
]
*/
export class Metrics {
    constructor(metricsCodes = []) {
        this.metrics = new Map();
        this.thresholds = {};
        for (const metric of metricsCodes) {
            for (const type of metric.types) {
                let targetKey = toCamelCase(`${metric.key}_${type}`);
                switch (type) {
                case 'trend':
                    this.metrics.set(targetKey, new Trend(targetKey, metric.isTime));
                    if ('trend' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['trend'];
                    }
                    break;
                case 'rate':
                    this.metrics.set(targetKey, new Rate(targetKey));
                    if ('rate' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['rate'];
                    }
                    break;
                case 'counter':
                    this.metrics.set(targetKey, new Counter(targetKey, metric.isTime));
                    if ('counter' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['counter'];
                    }
                    break;
                }
            }
        }
    }

    addTrend(metricKey, value) {
        let key = toCamelCase(`${metricKey}_trend`);

        return this._addValue(key, value);
    }

    addCounter(metricKey, value) {
        let key = toCamelCase(`${metricKey}_counter`);

        return this._addValue(key, value);
    }

    addRate(metricKey, value) {
        let key = toCamelCase(`${metricKey}_rate`);

        return this._addValue(key, value);
    }

    _addValue(key, value) {
        if (this.metrics.has(key)) {
            this.metrics.get(key).add(value);
            return true;
        }
        return false;
    }

    getThresholds() {
        return this.thresholds;
    }
}
