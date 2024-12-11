import { Trend } from 'k6/metrics';
import { group } from 'k6';
import { DynamicFixtureUtil } from '../../utils/dynamic-fixture.util.js';
import AuthUtil from '../../utils/auth.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import OptionsUtil from '../../utils/options.util.js';

const vus = 1;
const iterations = 10;

const metricName = 'SAPI7_checkout_70';
let metric = new Trend(metricName);

export const options = OptionsUtil.loadOptions();
options.scenarios = {
    [metricName]: {
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
    return (new DynamicFixtureUtil()).haveCustomersWithQuotes(vus, iterations, 10);
}

export default function (data) {
    const customerIndex = (__VU - 1) % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];
    const quoteIndex = __ITER % quoteIds.length;

    let bearerToken;
    group('Authorization', () => {
        bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    });

    group('Checkout', () => {
        const checkoutResource = new CheckoutResource(quoteIds[quoteIndex], bearerToken);
        const response = checkoutResource.checkout();

        metric.add(response.timings.duration);
    });
}
