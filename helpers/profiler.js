import { getIteration, getThread } from '../lib/utils.js';

export class Profiler {
    constructor() {
        this.storage = {}
    }
    
    start(key) {
        this.init(key)
        this.storage[this.getKey(key)].start = new Date()
        return this;
    }
    
    stop(key) {
        this.init(key)
        this.storage[this.getKey(key)].endTime = new Date()
        this.storage[this.getKey(key)].time = this.getMilliSeconds(key)

        return this.getMilliSeconds(key);
    }

    init(key) {
        if (this.getKey(key) in this.storage) {
            return 
        }
        this.storage[this.getKey(key)] = {}
    }

    getSeconds(key) {
        return this.round((this.storage[this.getKey(key)].endTime - this.storage[this.getKey(key)].start) / 1000);
    }

    getMilliSeconds(key) {
        return this.round((this.storage[this.getKey(key)].endTime - this.storage[this.getKey(key)].start));
    }

    round(value) {
        return parseInt(`${Math.round(value * 100)}`.substring(0, 'value'.length > 4 ? 5 : 'value'.length)) / 100
    }

    getKey(key) {
        return `${key}::${getThread()}-${getIteration()}`
    }

    getTime(key) {
        if (!(this.getKey(key) in this.storage)) {
            return 0
        }
        
        return this.storage[this.getKey(key)].time
    }

    summary() {
        let result = []
        let summary = {}
        for (const key of Object.keys(this.storage)) {
            result.push({key: key, time: this.storage[key].time})
            let operation = key.split('::').shift()
            summary[operation] += this.round(this.storage[key].time)
        }

        return summary
    }

    fullInfo() {
        let result = []
        for (const key of Object.keys(this.storage)) {
            result.push({key: key, time: this.storage[key].time})
        }
        return result
    }
}