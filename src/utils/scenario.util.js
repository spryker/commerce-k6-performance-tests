import EnvironmentUtil from './environment.util.js';

export function createScenario(
    tags = {},
    executor = EnvironmentUtil.getExecutor(),
    vus = EnvironmentUtil.getVus(),
    iterations = EnvironmentUtil.getIterations()
) {
    return {
        tags: tags,
        executor: executor,
        vus: vus,
        iterations: iterations,
    };
}