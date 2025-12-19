import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import exec from 'k6/execution';

export function capitalizeFirstLetter(string) {
    return string.length ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}
export function tlsMetricsToCsv(data, filter = "") {
    const rows = [];

    const checkoutVus = __ENV.AMOUNT_OF_CHECKOUT_VUS || "";
    const checkoutIterations = __ENV.AMOUNT_OF_CHECKOUT_ITERATIONS || "";
    const backofficeIteration = __ENV.AMOUNT_OF_BACKOFFICE_ITERATIONS || "";
    const amountOtTestExecution = __ENV.AMOUNT_OF_ITERATIONS || "";
    const backofficeVus = __ENV.AMOUNT_OF_BACKOFFICE_VUS || "";
    const targetEnv = __ENV.DATA_EXCHANGE_ENV || "";
    const scenario = __ENV.SUMMARY_SCENARIO_NAME || "";
    const tlsStatus = __ENV.TLS_STATUS || false;

   // fixed order of metric keys
    const fixedMetricKeys = ["avg", "min", "med", "max", "p(90)", "p(95)"];
    const headers = ["metric", "DATA_EXCHANGE_ENV", "TLS_STATUS", "SUMMARY_SCENARIO_NAME", "SUMMARY_SCENARIO_NAME_COMBINED", "AMOUNT_OF_BACKOFFICE_VUS", "AMOUNT_OF_ITERATIONS", "AMOUNT_OF_BACKOFFICE_ITERATIONS", "AMOUNT_OF_CHECKOUT_ITERATIONS","AMOUNT_OF_CHECKOUT_VUS", ...fixedMetricKeys];
    rows.push(headers.join(','));

    // Collecting rows
    for (const [name, metric] of Object.entries(data.metrics)) {
        if (!name.includes(filter)) continue;

        const values = metric.values || {};
        const row = [
            name,
            targetEnv,
            `TLS ${tlsStatus}`,
            scenario,
            `${scenario} TLS ${tlsStatus}`,
            backofficeVus,
            amountOtTestExecution,
            backofficeIteration,
            checkoutIterations,
            checkoutVus,
            ...fixedMetricKeys.map(key => {
                return values[key] !== undefined ? values[key] : ""
            })
        ];

        rows.push(row.join(','));
    }

    return rows.join('\n');
}

export function handleSummaryTls(data, result) {
    if (__ENV.SUMMARY_CSV) {
        let startDate = new Date().toISOString().split('.').shift()
        let targetFolder = startDate?.split("T").shift()
        let info = __ENV.SUMMARY_SCENARIO_NAME && __ENV.SUMMARY_SCENARIO_NAME.length ? capitalizeFirstLetter(__ENV.SUMMARY_SCENARIO_NAME) : ''
        let additionalPath = __ENV.SUMMARY_CSV
            .replace('{pathToTargetFolder}', targetFolder)
            .replace('{startDate}', startDate)
            .replace('{scenario}', info);

        result[additionalPath] = tlsMetricsToCsv(data, 'Trend');
    }

    return result;
}

export function handleSummary(data) {
    let result = {
        'stdout': textSummary(data, { indent: "", enableColors: true }),
    }
    switch (__ENV.SUMMARY_TYPE.toLowerCase()) {
        case 'tls':
            return handleSummaryTls(data, result);
        default:
            return result
    }
}

export function handleSummary_(data) {
    let result = {
        'stdout': textSummary(data, { indent: "", enableColors: true }),
    }

    let startDate = new Date().toISOString().split('.').shift()
    let targetFolder = startDate?.split("T").shift()
    let info = __ENV.SUMMARY_SCENARIO_NAME && __ENV.SUMMARY_SCENARIO_NAME.length ? capitalizeFirstLetter(__ENV.SUMMARY_SCENARIO_NAME) : ''
    let targetKey = __ENV.SUMMARY_FILE_FULL_PATH?.replace('{pathToTargetFolder}', targetFolder).replace('{startDate}', startDate).replace('{scenario}', info)

    if (__ENV.SUMMARY_FILE_FULL_PATH) {
        data.executionConfig = {}

        // let variablesToAdd = [
        //     // 'OTEL_INSTRUMENTATION',
        //     // 'OPCACHE_PRELOAD',
        //     'AMOUNT_OF_ITERATIONS',
        //     'AMOUNT_OF_VUS',
        //     // 'AMOUNT_OF_CHECKOUT_ITERATIONS',
        //     // 'AMOUNT_OF_CHECKOUT_VUS',
        //     // 'AMOUNT_OF_BACKOFFICE_ITERATIONS',
        //     // 'AMOUNT_OF_BACKOFFICE_VUS',
        //     // 'AMOUNT_OF_RAMP_VUS',
        //     // 'RAMP_STAGE_DURATION',
        //     'DATA_EXCHANGE_ENV',
        //     'K6_NO_THRESHOLDS',
        //     'STORES_FROM_ENV',
        //     // 'SCREENSHOT_ACTIVE',
        //     // 'DMS_WHITELIST_STORES_FROM_CONFIG',
        //     'USE_PREDEFINED_PRODUCTS',
        //     'CACHE_ENGINE',
        //     'CACHE_ENGINE_VERSION',
        //     'COMPRESSION_STATE',
        //     'TEST_START_DATE_TIME',
        //     // 'MAX_CART_SIZE',
        //     // 'RANDOM_CART_SIZE_WITHIN_TARGET_MAX',
        //     // 'USE_EXISTING_CUSTOMER_ACCOUNTS',
        //     // 'DMS_AMOUNT_OF_STORES',
        //     // 'DMS_AMOUNT_OF_LOCALES',
        //
        // ]


        let variablesToAdd = [
            'AMOUNT_OF_ITERATIONS',
            'AMOUNT_OF_VUS',
            // 'AMOUNT_OF_CHECKOUT_ITERATIONS',
            // 'AMOUNT_OF_CHECKOUT_VUS',
            'DATA_EXCHANGE_ENV',
            'K6_NO_THRESHOLDS',
            'STORES_FROM_ENV',
        ]

        for (const variable of variablesToAdd) {
            if (__ENV[variable]) {
                data.executionConfig[variable] = __ENV[variable]
            }
        }
        data.executionConfig['TEST_END_DATE_TIME'] = new Date().toISOString().replace('T', ' ').split('.').shift()

        result[targetKey] = JSON.stringify(data)
    }

    if (__ENV.SUMMARY_FILE_ADDITIONAL_PATH) {
        let additionalPath = __ENV.SUMMARY_FILE_ADDITIONAL_PATH
            .replace('{pathToTargetFolder}', targetFolder)
            .replace('{startDate}', startDate)
            .replace('{scenario}', info);

        result[additionalPath] = JSON.stringify(data);
    }

    return result;
}