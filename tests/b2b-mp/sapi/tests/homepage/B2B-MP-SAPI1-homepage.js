import { SharedHomepageScenario } from '../../../../cross-product/sapi/scenarios/homepage/shared-homepage-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'SAPI1';

const homepageScenario = new SharedHomepageScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI1_Homepage: {
        exec: 'executeHomepageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'Homepage',
        },
        iterations: 10
    },
};
options.thresholds[`http_req_duration{url:${homepageScenario.getStorefrontApiBaseUrl()}/cms-pages/\${}}`] = ['avg<56'];

export function executeHomepageScenario() {
    homepageScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
