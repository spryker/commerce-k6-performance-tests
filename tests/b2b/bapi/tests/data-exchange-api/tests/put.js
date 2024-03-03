import { getExecutionConfiguration, loadDefaultOptions } from "../../../../../../lib/utils.js";
import { ApiPutPayloadScenario } from "../scenarios/api-put-payload-scenario.js";

export const options = loadDefaultOptions();

let executionConfig = getExecutionConfiguration(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE, __ENV.DATA_EXCHANGE_PAYLOAD_UPDATE_CHUNK_SIZE, __ENV.DATA_EXCHANGE_THREADS)

let productTemplate = open("../template/product.json")
let productLabelTemplate = open("../template/productLabel.json")

options.scenarios = {
    ProductPutVUS: {
        exec: 'productPutScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-PUT',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: "1200m"
    },
};

const productPutCreateScenario = new ApiPutPayloadScenario('DEX', executionConfig.chunkSize);

export function productPutScenario() {
    productPutCreateScenario.execute(productTemplate, productLabelTemplate);
}
