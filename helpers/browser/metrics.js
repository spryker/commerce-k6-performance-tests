import { Trend, Rate, Counter } from 'k6/metrics';
import { toCamelCase } from '../../lib/utils.js';

/*
metricsCodes = [
    {
        key: stripe_page_loading_time,
        types: ['trend', 'rate'],
        isTime: {
            trend: true,
        },
        thresholds: {
            trend: ['p(95)<60000'],
            rate: ['rate==1']
        }
    },
    {
        key: invoice_page_loading_time,
        types: ['trend', 'rate', counter],
        isTime: {
            trend: true,
            counter: false
        },
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
                let isTime = true
                switch (type) {
                case 'trend':
                    if ('trend' in metric.isTime) {
                        isTime = metric.isTime.trend
                    }
                    this.metrics.set(targetKey, new Trend(targetKey, isTime));
                    if ('thresholds' in metric && 'trend' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['trend'];
                    }
                    break;
                case 'rate':
                    this.metrics.set(targetKey, new Rate(targetKey));
                    if ('thresholds' in metric && 'rate' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['rate'];
                    }
                    break;
                case 'counter':
                    if ('counter' in metric.isTime) {
                        isTime = metric.isTime.counter
                    }
                    this.metrics.set(targetKey, new Counter(targetKey, isTime));
                    if ('thresholds' in metric && 'counter' in metric.thresholds) {
                        this.thresholds[targetKey] = metric.thresholds['counter'];
                    }
                    break;
                }
            }
        }
    }

    add(metricKey, response, successStatusCode = 200) {
        if (response) {
            this.addTrend(metricKey, response.timings.duration)
            this.addRate(metricKey, response.status === successStatusCode)
        }

        this.addCounter(metricKey, 1)
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
