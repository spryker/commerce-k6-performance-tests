import { ApiPostPayloadScenario } from "../scenarios/api-post-payload-scenario.js";
import { getExecutionConfiguration, loadDefaultOptions } from "../../../../../../lib/utils.js";

export const options = loadDefaultOptions();

let productTemplate = open("../template/product.json")
let productImageTemplate = open("../template/productImage.json")
let productLabelTemplate = open("../template/productLabel.json")

let executionConfig = getExecutionConfiguration(__ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE, __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE, __ENV.DATA_EXCHANGE_THREADS)

options.scenarios = {
    ProductCreatePostVUS: {
        exec: 'productPostScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-POST',
            testGroup: 'DataExchange',
        },
        iterations: executionConfig.amountOfIteration,
        vus: executionConfig.threads,
        maxDuration: "1200m"
    },
};

const productCreateScenario = new ApiPostPayloadScenario('DEX', executionConfig.chunkSize);
export function productPostScenario() {
    productCreateScenario.execute(productTemplate, productImageTemplate, productLabelTemplate);
}
