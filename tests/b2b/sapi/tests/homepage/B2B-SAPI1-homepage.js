import { SharedHomepageScenario } from '../../../../cross-product/sapi/scenarios/homepage/shared-homepage-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

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

const homepageScenario = new SharedHomepageScenario('B2B');

export function executeHomepageScenario() {
    homepageScenario.execute();
}
