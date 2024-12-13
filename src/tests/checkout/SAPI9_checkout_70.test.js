import { Trend } from 'k6/metrics';
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util.js';
import OptionsUtil from '../../utils/options.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import { CheckoutFixture } from '../../fixtures/checkout.fixture.js';

const vus = 1;
const iterations = 10;
const checkoutFixture = new CheckoutFixture({
    customerCount: vus,
    cartCount: iterations,
    itemCount: 70,
});

const metricName = 'SAPI9_checkout_70';
let metric = new Trend(metricName);

export const options = OptionsUtil.loadOptions();
options.thresholds = {[metricName]: ['avg<300']};
options.scenarios = {
    [metricName]: {
        executor: 'per-vu-iterations',
        tags: {
            testId: 'SAPI9',
            testGroup: 'Checkout',
        },
        vus: vus,
        iterations: iterations,
    },
};

export function setup() {
    return checkoutFixture.getData();
}

export default function (data) {
    const { customerEmail, idCart } = checkoutFixture.iterateData(data, __VU, __ITER);

    let bearerToken;
    group('Authorization', () => {
        bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    });

    group(metricName, () => {
        const checkoutResource = new CheckoutResource(idCart, bearerToken);
        const response = checkoutResource.checkout();

        metric.add(response.timings.duration);
    });
}
