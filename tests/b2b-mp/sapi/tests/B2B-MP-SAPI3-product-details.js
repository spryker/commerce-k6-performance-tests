import { ProductDetailsScenario } from "../scenarios/product-details-scenario.js";
import { loadDefaultOptions } from "../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI3_Product_Details: {
        exec: 'executeProductDetailsScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI3'
        },
        iterations: 10
    },
};

const productDetailsScenario = new ProductDetailsScenario();

export function executeProductDetailsScenario() {
    productDetailsScenario.execute();
}
