import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { Trend } from 'k6/metrics';
import { group } from 'k6';
import AuthUtil from '../../../../../src/utils/auth.util.js';
import CheckoutResource from '../../../../../src/resources/checkout.resource.js';
import { DynamicFixtureUtil } from '../../../../../src/utils/dynamic-fixture.util.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 1;
const iterations = 10;

let metric = new Trend('SAPI7_checkout_70');

export const options = loadDefaultOptions();
options.scenarios = {
    SAPI7_checkout_70: {
        executor: 'shared-iterations',
        tags: {
            testId: 'SAPI7',
            testGroup: 'Checkout',
        },
        vus: vus,
        iterations: iterations,
    },
};

export function setup() {
    return (new DynamicFixtureUtil()).haveCustomersWithQuotes(vus, iterations, 70);
}

export default function (data) {
    const customerIndex = (__VU - 1) % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = __ITER % quoteIds.length;

    group('Authorization', () => {
        const bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);

        group('Checkout', () => {
            const checkoutResource = new CheckoutResource(quoteIds[quoteIndex], bearerToken);
            const response = checkoutResource.checkout();

            metric.add(response.timings.duration);
        });
    });
}
