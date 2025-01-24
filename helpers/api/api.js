import {Http} from "../../lib/http.js";
import {AssertionsHelper} from "../assertions-helper.js";

export default class Api {
    constructor(baseUrl, metrics, targetEnv) {
        this.baseUrl = baseUrl;
        this.metrics = metrics;
        this.http = new Http(targetEnv);
        this.assertionsHelper = new AssertionsHelper();
    }

    auth() {

    }

    post() {

    }

    get() {

    }
}