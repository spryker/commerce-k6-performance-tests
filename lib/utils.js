import { Rate } from "k6/metrics";
import { fail } from "k6";

export let errorRate = new Rate("errors");

export function getRequiredEnvVariable(variableName) {
    if (!eval(`__ENV.${variableName}`)) {
        throw new Error(`${variableName} env variable must be specified.`);
    }

    return eval(`__ENV.${variableName}`);
}

/**
 * See https://k6.io/docs/using-k6/tags-and-groups/#test-wide-tags
 */
export function loadOptions(optionsFile) {
    let options = JSON.parse(open(__ENV.PROJECT_DIR + "/options/" + optionsFile + ".json"));

    if (options.tags === undefined) {
        options.tags = {};
    }

    let tags = {
        gitRepository: getRequiredEnvVariable('GIT_REPO'),
        gitBranch: getRequiredEnvVariable('GIT_BRANCH'),
        gitCommit: getRequiredEnvVariable('GIT_HASH'),
        gitTag: __ENV.GIT_TAG,
        testRunId: getRequiredEnvVariable('SPRYKER_TEST_RUN_ID'),
        testRunnerHostName: getRequiredEnvVariable('SPRYKER_TEST_RUNNER_HOSTNAME'),
        testEnvironment: getRequiredEnvVariable('SPRYKER_TEST_ENVIRONMENT')
    };

    // Adds the git* tags if they are NOT already present.
    Object.assign(options.tags, Object.fromEntries(
        Object.entries(tags).filter(([key]) => !(key in options.tags))
    ));

    return options;
}

export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function debug(...data) {
    if (parseInt(__ENV.DATA_EXCHANGE_DEBUG) === 1) {
        console.log(data)
    }
}

export function getExecutionConfiguration(targetCatalogSize, chunkSize, threads) {
    chunkSize = chunkSize < targetCatalogSize ? chunkSize : targetCatalogSize
    
    const amountOfIteration = Math.ceil(targetCatalogSize / chunkSize)
    threads = amountOfIteration < threads ? amountOfIteration : threads

    let config = {
        amountOfIteration: amountOfIteration, 
        chunkSize: chunkSize,
        threads: threads,
        finalCatalogSize: chunkSize * amountOfIteration
    }

    console.log('Execution config', config)

    return config
}

export function loadDefaultOptions() {
    return loadOptions('default-options');
}

export function loadEnvironmentConfig(serviceFile) {
    if (!__ENV.K6_HOSTENV) {
        fail('K6_HOSTENV has not be set. Exiting...');
    }

    let config = JSON.parse(open(__ENV.PROJECT_DIR + "/environments/" + serviceFile + ".json"))[__ENV.K6_HOSTENV];
    return Object.assign(config, { "environment": __ENV.K6_HOSTENV });
}

export function logError(response) {
    errorRate.add(1);
    console.log("API returned response code '" + response.status + "' for url: " + response.url);
}
