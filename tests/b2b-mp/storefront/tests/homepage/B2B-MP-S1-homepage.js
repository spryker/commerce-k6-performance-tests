import { HomepageScenario } from "../../scenarios/homepage/homepage-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

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

const homepageScenario= new HomepageScenario();

export function executeHomepageScenario() {
    homepageScenario.execute();
}
