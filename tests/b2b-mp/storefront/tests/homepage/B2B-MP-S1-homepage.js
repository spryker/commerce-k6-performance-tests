import { SharedHomepageScenario } from '../../../../cross-product/storefront/scenarios/homepage/shared-homepage-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'S1';

export const options = loadDefaultOptions();

options.scenarios = {
    S1_Homepage: {
        exec: 'executeHomepageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: testId,
            testGroup: 'Homepage',
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ['avg<388'];

const homepageScenario= new SharedHomepageScenario(environment);

export function executeHomepageScenario() {
    homepageScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
