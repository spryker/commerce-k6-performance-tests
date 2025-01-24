import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import exec from 'k6/execution';

export function capitalizeFirstLetter(string) {
    return string.length ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

export function handleSummary(data) {
    let result = {
        'stdout': textSummary(data, { indent: "", enableColors: true }),
    }

    if (__ENV.SUMMARY_FILE_FULL_PATH) {
        let startDate = new Date().toISOString().split('.').shift()
        let targetFolder = startDate?.split("T").shift()
        let info = __ENV.SUMMARY_SCENARIO_NAME && __ENV.SUMMARY_SCENARIO_NAME.length ? capitalizeFirstLetter(__ENV.SUMMARY_SCENARIO_NAME) : ''
        let targetKey = __ENV.SUMMARY_FILE_FULL_PATH?.replace('{pathToTargetFolder}', targetFolder).replace('{startDate}', startDate).replace('{scenario}', info)

        data.executionConfig = {}

        let variablesToAdd = [
            'OTEL_INSTRUMENTATION',
            'OPCACHE_PRELOAD',
            'AMOUNT_OF_CHECKOUT_ITERATIONS',
            'AMOUNT_OF_CHECKOUT_VUS',
            'AMOUNT_OF_BACKOFFICE_ITERATIONS',
            'AMOUNT_OF_BACKOFFICE_VUS',
            'AMOUNT_OF_RAMP_VUS',
            'RAMP_STAGE_DURATION',
            'DATA_EXCHANGE_ENV',
            'K6_NO_THRESHOLDS',
            'STORES_FROM_ENV',
            'SCREENSHOT_ACTIVE',
            'DMS_WHITELIST_STORES_FROM_CONFIG',
            'USE_PREDEFINED_PRODUCTS',
            'MAX_CART_SIZE',
            'RANDOM_CART_SIZE_WITHIN_TARGET_MAX',
            'USE_EXISTING_CUSTOMER_ACCOUNTS',
            'DMS_AMOUNT_OF_STORES',
            'DMS_AMOUNT_OF_LOCALES',
        ]

        for (const variable of variablesToAdd) {
            if (__ENV[variable]) {
                data.executionConfig[variable] = __ENV[variable]
            }
        }

        result[targetKey] = JSON.stringify(data)
    }

    return result;
}