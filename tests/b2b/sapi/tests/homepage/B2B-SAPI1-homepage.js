import { SharedHomepageScenario } from '../../../../cross-product/sapi/scenarios/homepage/shared-homepage-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

const homepageScenario = new SharedHomepageScenario('B2B');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI1_Homepage: {
        exec: 'executeHomepageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI1',
            testGroup: 'Homepage',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${homepageScenario.getStorefrontApiBaseUrl()}/cms-pages/\$\{\}}`] = ['avg<59'];

export function executeHomepageScenario() {
    homepageScenario.execute();
}
