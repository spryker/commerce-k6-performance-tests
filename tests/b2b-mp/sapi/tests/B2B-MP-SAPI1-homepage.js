import { HomepageScenario } from "../scenarios/homepage-scenario.js";
import { loadDefaultOptions } from "../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI1_Homepage: {
        exec: 'executeHomepageScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI1'
        },
        iterations: 10
    },
};

const homepageScenario = new HomepageScenario();

export function executeHomepageScenario() {
    homepageScenario.execute();
}
