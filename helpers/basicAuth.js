import encoding from 'k6/encoding';

export default class BasicAuth {
    constructor(userName, password) {
        this.userName = userName;
        this.password = password;
    }

    getAuthHeader() {
        return {
            Authorization: `${this.getAuthValue()}`,
        };
    }

    getAuthValue() {
        return `Basic ${encoding.b64encode(`${this.userName}:${this.password}`)}`;
    }
}
