import { Profiler } from "../../../../../../helpers/profiler.js";
import { getExecutionConfiguration, loadDefaultOptions } from "../../../../../../lib/utils.js";
import { ApiPatchPayloadScenario } from "../scenarios/api-patch-payload-scenario.js";

export const options = loadDefaultOptions();

let productTemplate = open("../template/product.json")
let productLabelTemplate = open("../template/productLabel.json")
let profiler = new Profiler()

let executionConfig = getExecutionConfiguration(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE, __ENV.DATA_EXCHANGE_PAYLOAD_UPDATE_CHUNK_SIZE, __ENV.DATA_EXCHANGE_THREADS)

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

const productPatchCreateScenario = new ApiPatchPayloadScenario('DEX', executionConfig.chunkSize);

export function productPatchScenario() {
    productPatchCreateScenario.execute(productTemplate, productLabelTemplate, profiler);
}
