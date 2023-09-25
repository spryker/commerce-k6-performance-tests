import { SharedQuickOrderScenario } from "../../../../cross-product/storefront/scenarios/quick-order/shared-quick-order-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    S5_Quick_order_1_item: {
        exec: 'executeQuickOrderScenario',
        executor: 'shared-iterations',
        env: {
            productSku: __ENV.productSku || '657712',
            numberOfItems: __ENV.numberOfItems || '1',
        },
        tags: {
            testId: 'S5',
            testGroup: 'Quick order',
        },
        options: {
            browser: {
                type: 'chromium',
            },
        },
        iterations: 10,
    },
};

const quickOrderScenario = new SharedQuickOrderScenario('B2B_MP');

export async function executeQuickOrderScenario() {
    await quickOrderScenario.execute();
}

