import {Trend} from 'k6/metrics';
import {group} from 'k6';
import AuthUtil from '../../utils/auth.util.js';
import OptionsUtil from '../../utils/options.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import { CheckoutFixture } from '../../fixtures/checkout.fixture.js';
import EnvironmentUtil from '../../utils/environment.util.js';

const vus = EnvironmentUtil.getVus();
const iterations = EnvironmentUtil.getIterations();
const checkoutFixture = new CheckoutFixture({
    customerCount: vus,
    cartCount: iterations,
    itemCount: 1,
    defaultItemPrice: 10000, // Skipping global thresholds during checkout
});

const metricName = 'SAPI7_checkout_1';
let metric = new Trend(metricName);

export const options = OptionsUtil.loadOptions();
options.thresholds = {[metricName]: ['avg<300']};
options.scenarios = {
    [metricName]: {
        executor: EnvironmentUtil.getExecutor(),
        tags: {
            testId: 'SAPI7',
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
    const {customerEmail, idCart} = checkoutFixture.iterateData(data, __VU, __ITER);

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
