
export default class Url {
    constructor(baseUrl) {
        let parts = baseUrl.split('?')
        this.baseUrl = this.trimLastSlash(parts.shift());
        let query = parts.shift()
        this.queryString = query ? query : '';
    }

    get(uri) {
        let targetUrl = this.getWithoutQueryString(uri)
        if (this.queryString.length) {
            targetUrl = [targetUrl, this.queryString].join('?')
        }
        return targetUrl
    }
    
    getWithoutQueryString(uri) {
        return [this.baseUrl, this.trimFirstSlash(uri)].join('/')
    }

    trimLastSlash(info) {
        if (String(info).lastIndexOf('/') === info.length - 1) {
            return info.slice(0, info.length - 1);
        }
        return info
    }

    trimFirstSlash(info) {
        if (info.indexOf('/') === 0) {
            return info.slice(1, info.length);
        }
        return info
    }
}