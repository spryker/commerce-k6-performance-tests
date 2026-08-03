// tags: smoke, load, soak, checkout, SAPI
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';
import { CheckoutFixture } from '../../fixtures/checkout.fixture';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI7',
  group: 'Checkout',
  metrics: ['SAPI7_post_checkout'],
  thresholds: {
    SAPI7_post_checkout: {
      smoke: ['avg<3600'],
      load: ['avg<500'],
      soak: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixtureConfig = {
  customerCount: EnvironmentUtil.getTestType() === 'soak' ? EnvironmentUtil.getRampVus() : testConfiguration.vus,
  // One spare cart per customer for the setup warm-up checkout (iterations use carts 0..n-1).
  cartCount: EnvironmentUtil.getTestType() === 'soak' ? 400 : testConfiguration.iterations + 1,
  itemCount: 1,
  defaultItemPrice: 10000,
};

let fixture = new CheckoutFixture(fixtureConfig);

export function setup() {
  const data = fixture.getData();

  // Warm-up: place one order before the timed iterations. The first checkout after a redeploy
  // pays one-off warm-up costs and would otherwise skew the smoke avg.
  if (EnvironmentUtil.getTestType() !== 'soak') {
    const { customerEmail, quoteIds } = data[0];
    const warmupCartId = quoteIds[quoteIds.length - 1];
    const bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    new CheckoutResource(warmupCartId, customerEmail, bearerToken).checkout();
  }

  return data;
}

export default function (data) {
  const customer = fixture.iterateData(data, exec.vu.idInTest);
  const customerEmail = customer.customerEmail;
  let idCart = customer.idCart;

  let bearerToken;
  group('Authorization', () => {
    if (EnvironmentUtil.getUseStaticFixtures()) {
      bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail, customer.customerPassword);
    } else {
      bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
    }
  });

  group(testConfiguration.group, () => {
    const checkoutResource = new CheckoutResource(idCart, customerEmail, bearerToken);
    const response = checkoutResource.checkout();
    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
