import { ProductSearchScenario } from "../scenarios/product-search-scenario.js";
import { loadDefaultOptions } from "../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI2_Product_Search: {
        exec: 'executeProductSearchScenario',
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI2'
        },
        iterations: 10
    },
};

const productSearchScenario = new ProductSearchScenario();

export function executeProductSearchScenario() {
    productSearchScenario.execute();
}
