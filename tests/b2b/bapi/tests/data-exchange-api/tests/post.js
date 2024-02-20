import { ApiPostPayloadScenario } from "../scenarios/api-post-payload-scenario.js";
import { loadDefaultOptions } from "../../../../../../lib/utils.js";

export const options = loadDefaultOptions();

const chunkSize = __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE ? __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE : 1000
const threads = __ENV.DATA_EXCHANGE_THREADS ? __ENV.DATA_EXCHANGE_THREADS : 1

let targetCatalogSize = __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE ? __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE : 10000

const amountOfIteration = Math.ceil(targetCatalogSize / chunkSize)

console.info('amountOfIteration', amountOfIteration, 'targetCatalogSize', targetCatalogSize, 'chunkSize', chunkSize, 'target product amount', chunkSize * amountOfIteration)

let productTemplate = open("../template/product.json")
let productImageTemplate = open("../template/productImage.json")
let productLabelTemplate = open("../template/productLabel.json")

options.scenarios = {
    ProductCreatePostVUS: {
        exec: 'productPostScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'DX-POST',
            testGroup: 'DataExchange',
        },
        iterations: amountOfIteration,
        vus: threads,
        maxDuration: "1200m"
    },
};

const productCreateScenario = new ApiPostPayloadScenario('DEX', chunkSize);
export function productPostScenario() {
    productCreateScenario.execute(productTemplate, productImageTemplate, productLabelTemplate);
}
