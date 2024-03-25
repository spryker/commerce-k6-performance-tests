import { Profiler } from "../../../../../../helpers/profiler.js";
import { getExecutionConfiguration, getTemplateFolder, loadDefaultOptions } from "../../../../../../lib/utils.js";
import { ApiPatchPayloadScenario } from "../scenarios/api-patch-payload-scenario.js";

export const options = loadDefaultOptions();

let productTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/product.json`)
let productConcreteTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/concrete.json`)
let productLabelTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/productLabel.json`)

let profiler = new Profiler()

let executionConfig = getExecutionConfiguration(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE, __ENV.DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE, __ENV.DATA_EXCHANGE_THREADS, __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT)

options.scenarios = {
    ProductCreatePatchVUS: {
        exec: 'productPatchScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-PATCH',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: "1200m"
    },
};

const productPatchCreateScenario = new ApiPatchPayloadScenario('DEX', executionConfig.chunkSize, executionConfig.concreteMaxAmount);

export function productPatchScenario() {
    productPatchCreateScenario.execute(productTemplate, productConcreteTemplate, productLabelTemplate, profiler);
}
