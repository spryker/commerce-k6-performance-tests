import { QuickOrderScenario } from '../../scenarios/quick-order/quick-order-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';

export const options = loadDefaultOptions();
options.scenarios = {
    S5_Quick_order_1_item: {
        exec: 'executeQuickOrderScenario',
        executor: 'shared-iterations',
        env: {
            productSku: '657712',
            numberOfItems: '1',
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

const quickOrderScenario = new QuickOrderScenario('B2B');

export async function executeQuickOrderScenario() {
    await quickOrderScenario.execute();
}
