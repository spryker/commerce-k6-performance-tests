import {group} from 'k6';
import AuthUtil from '../../utils/auth.util.js';
import OptionsUtil from '../../utils/options.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import { CheckoutFixture } from '../../fixtures/checkout.fixture.js';
import EnvironmentUtil from '../../utils/environment.util.js';
import {createMetrics} from '../../utils/metric.util.js';

const testConfiguration = {
    id: 'SAPI9',
    group: 'Checkout',
    metrics: [
        'SAPI9_checkout_70',
    ],
    thresholds: {
        SAPI9_checkout_70: {
            smoke: ['avg<300'],
            load: ['avg<500'],
        }
    }
}

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const dynamicFixture = new CheckoutFixture({
    customerCount: EnvironmentUtil.getVus(),
    cartCount: EnvironmentUtil.getIterations(),
    itemCount: 70,
});

export function setup() {
    return dynamicFixture.getData();
}

export default function (data) {
    const {customerEmail, idCart} = dynamicFixture.iterateData(data);

    let bearerToken;
    group('Authorization', () => {
        bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    });

    group(testConfiguration.group, () => {
        const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
        const response = checkoutResource.checkout();
        metrics[testConfiguration.metrics[0]].add(response.timings.duration);
    });
}
