import { Rate } from 'k6/metrics';
import { fail } from 'k6';
import { uuidv4, randomString as k6RandomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import read from 'k6/x/read';
import exec from 'k6/execution';

export let errorRate = new Rate('errors');

export function getRequiredEnvVariable(variableName) {
    if (!eval(`__ENV.${variableName}`)) {
        throw new Error(`${variableName} env variable must be specified.`);
    }

    return eval(`__ENV.${variableName}`);
}

export function getBasicAuthCredentials() {
    return {
        username: __ENV['BASIC_AUTH_USERNAME'],
        password: __ENV['BASIC_AUTH_PASSWORD'],
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
        testRunnerHostName: getRequiredEnvVariable('SPRYKER_TEST_RUNNER_HOSTNAME')
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

export function randomString(length = 8) {
    return k6RandomString(length);
}

export function randomHex(length = 8) {
    return k6RandomString(length, '0123456789abcdef');
}

export function debug(...data) {
    if (parseInt(__ENV.DATA_EXCHANGE_DEBUG) === 1) {
        console.log(data)
    }
}

export function getThread() {
    return  parseInt(exec.vu.idInInstance)
}

export function getIteration() {
    return parseInt(exec.scenario.iterationInInstance)
}

export function getStoreWhiteList() {
    const useFromConfig = Boolean(parseInt(__ENV.DMS_WHITELIST_STORES_FROM_CONFIG))
    const storeFile = String(__ENV.DMS_STORES_CONFIGURATION_FILE)
    if (useFromConfig && storeFile.length) {
        try {
            let stores = JSON.parse(read.readFile(storeFile).content)
            return stores.map((store) => store.storeCode)
        } catch (e) {
            console.warn('Ignoring store whitelisting from configuration.', e)
        }
    }
    return __ENV.DATA_EXCHANGE_STORE_WHITELIST.length ? __ENV.DATA_EXCHANGE_STORE_WHITELIST.split(',').filter((el) => el.length) : []
}

export function useOnlyDefaultStoreLocale() {
    return Number(__ENV.DATA_EXCHANGE_USE_DEFAULT_STORE_LOCALE) > 0
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
        fail('K6_HOSTENV has not been set. Exiting...');
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