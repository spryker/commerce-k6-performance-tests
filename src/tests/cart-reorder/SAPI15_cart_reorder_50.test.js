import {group} from 'k6';
import AuthUtil from '../../utils/auth.util.js';
import OptionsUtil from '../../utils/options.util.js';
import CheckoutResource from '../../resources/checkout.resource.js';
import { CheckoutFixture } from '../../fixtures/checkout.fixture.js';
import EnvironmentUtil from '../../utils/environment.util.js';
import {createMetrics} from '../../utils/metric.util.js';
import CartReorderResource from '../../resources/cart-reorder.resource.js';

const testConfiguration = {
    id: 'SAPI15',
    group: 'Cart Reorder',
    metrics: [
        'SAPI15_cart_reorder_50',
    ],
    thresholds: {
        SAPI15_cart_reorder_50: {
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
    itemCount: 50,
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

    let orderReference;
    group('Checkout', () => {
        const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
        orderReference = JSON.parse(checkoutResource.checkout().body).data.attributes.orderReference;
    });

    group(testConfiguration.group, () => {
        const cartReorderResource = new CartReorderResource(orderReference, bearerToken);
        const response = cartReorderResource.reorder();
        metrics[testConfiguration.metrics[0]].add(response.timings.duration);
    });
}
