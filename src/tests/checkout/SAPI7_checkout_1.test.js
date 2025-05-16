// tags: smoke, load, soak
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { CustomerFixture } from '../../fixtures/customer.fixture';
import CartsResource from '../../resources/carts.resource';
import exec from 'k6/execution';
import IteratorUtil from '../../utils/iterator.util';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI7',
  group: 'Checkout',
  metrics: ['SAPI7_post_checkout'],
  thresholds: {
    SAPI7_post_checkout: {
      smoke: ['avg<300'],
      load: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const fixture = CustomerFixture.createFixture({
    customerCount: testConfiguration.vus,
    itemCount: 5,
  });

  return fixture.getData();
}

export default function (data) {
  if (EnvironmentUtil.getTestType() === 'soak') {
    processSoak(data);
  } else {
    processSmokeLoad(data);
  }
}

function processSoak(data) {
  const customer = IteratorUtil.iterateData({ fixtureName: 'customer', data, vus: exec.vu.idInTest });
  const product = customer.products[0];

  const customerEmail = customer.customerEmail;

  let bearerToken;
  group('Authorization', () => {
    if (EnvironmentUtil.getUseStaticFixtures()) {
      bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail, customer.customerPassword);
    } else {
      bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    }
  });

  let idCart;
  group('Create cart', () => {
    const cartsResource = new CartsResource(bearerToken);
    const response = cartsResource.create(`Cart-${exec.vu.idInTest}`);

    idCart = JSON.parse(response.body).data.id;
  });

  group('Add to cart', () => {
    const cartsResource = new CartsResource(bearerToken);
    cartsResource.addItem(idCart, product.sku, 1, product.productOfferReference);
  });

  group(testConfiguration.group, () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}

function processSmokeLoad(data) {
  const { customerEmail, idCart } = CheckoutFixture.iterateData(data);

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
