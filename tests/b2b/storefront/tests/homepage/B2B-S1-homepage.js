import { SharedHomepageScenario } from '../../../../cross-product/storefront/scenarios/homepage/shared-homepage-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();

options.scenarios = {
    S1_Homepage: {
        exec: 'executeHomepageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'S1',
            testGroup: 'Homepage',
        },
        iterations: 10
    },
};
options.thresholds.http_req_duration = ["avg<398"];

const homepageScenario= new SharedHomepageScenario('B2B');

export function executeHomepageScenario() {
    homepageScenario.execute();
}
