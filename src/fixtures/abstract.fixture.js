import http from 'k6/http';
import { check } from 'k6';
import UrlUtil from '../utils/url.util.js';

export class AbstractFixture {

    sendPayload(payload) {
        const res = http.post(
            http.url`${UrlUtil.getBackendApiUrl()}/dynamic-fixtures`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                }
            },
        );

        check(res, {'Fixtures generated successfully.': (r) => r.status === 201});

        return res;
    }
}
