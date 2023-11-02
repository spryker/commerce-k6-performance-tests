import { QuickOrderScenario } from "../../scenarios/quick-order/quick-order-scenario.js";
import { loadDefaultOptions } from "../../../../../lib/utils.js";

export const options = loadDefaultOptions();
options.scenarios = {
    S6_Quick_order_70_items: {
        exec: 'executeQuickOrderScenario',
        executor: 'shared-iterations',
        env: {
            productSku: __ENV.productSku || '657712',
            numberOfItems: __ENV.numberOfItems || '70',
        },
        tags: {
            testId: 'S6',
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

const quickOrderScenario = new QuickOrderScenario('B2B');

export async function executeQuickOrderScenario() {
    await quickOrderScenario.execute();
}
