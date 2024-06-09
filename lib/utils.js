import { Rate } from 'k6/metrics';
import { fail } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export let errorRate = new Rate('errors');

export function getRequiredEnvVariable(variableName) {
    if (!eval(`__ENV.${variableName}`)) {
        throw new Error(`${variableName} env variable must be specified.`);
    }

    return eval(`__ENV.${variableName}`);
}

export function getBasicAuthCredentials(environment) {
    return {
        username: __ENV[`${environment}_AUTH_USERNAME`],
        password: __ENV[`${environment}_AUTH_PASSWORD`],
    };
}

/**
 * See https://k6.io/docs/using-k6/tags-and-groups/#test-wide-tags
 */
export function loadOptions(optionsFile) {
    let options = JSON.parse(open(__ENV.PROJECT_DIR + '/options/' + optionsFile + '.json'));

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
    Object.assign(options.tags, Object.fromEntries(Object.entries(tags).filter(([key]) => !(key in options.tags))));

    return options;
}

export function toCamelCase(str) {
    try {
        return str
            .split(/\W+|_+| +/)
            .map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                }

                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    } catch (e) {
        console.log('toCamelCase', str)
    }
}

export function uuid() {
    return uuidv4();
}

export function debug(...data) {
    if (parseInt(__ENV.DATA_EXCHANGE_DEBUG) === 1) {
        console.log(data)
    }
}

export function getThread() {
    return typeof __VU !== 'undefined' ? __VU : 1
}

export function getIteration() {
    return typeof __ITER !== 'undefined' ? __ITER : 1
}

export function getStoreWhiteList() {
    return __ENV.DATA_EXCHANGE_STORE_WHITELIST.length ? __ENV.DATA_EXCHANGE_STORE_WHITELIST.split(',').filter((el) => el.length) : []
}

export function getExecutionConfiguration(targetCatalogSize, chunkSize, threads, targetEnv, concreteMaxAmount = 2) {
    chunkSize = Number(chunkSize) < Number(targetCatalogSize) ? Number(chunkSize) : Number(targetCatalogSize)
    
    const amountOfIteration = Math.ceil(targetCatalogSize / chunkSize)
    threads = amountOfIteration < Number(threads) ? amountOfIteration : Number(threads)

    let config = {
        amountOfIteration: amountOfIteration, 
        chunkSize: chunkSize,
        threads: threads,
        finalCatalogSize: chunkSize * amountOfIteration,
        concreteMaxAmount: Number(concreteMaxAmount),
        targetEnv: targetEnv
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

    let config = JSON.parse(open(__ENV.PROJECT_DIR + '/environments/' + serviceFile + '.json'))[__ENV.K6_HOSTENV];
    return Object.assign(config, { 'environment': __ENV.K6_HOSTENV });
}

export function logError(response) {
    errorRate.add(1);
    console.log('API returned response code \'' + response.status + '\' for url: ' + response.url);
}

export function sortRandom(targetArray) {
    targetArray.sort(() => 0.5 - Math.random())

    return targetArray
}