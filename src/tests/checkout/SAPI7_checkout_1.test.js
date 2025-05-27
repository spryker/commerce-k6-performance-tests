// tags: smoke, load, soak, checkout, SAPI
import { group } from 'k6';
import AuthUtil from '../../utils/auth.util';
import OptionsUtil from '../../utils/options.util';
import CheckoutResource from '../../resources/checkout.resource';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import exec from 'k6/execution';
import {CheckoutFixture} from "../../fixtures/checkout.fixture";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI7',
  group: 'Checkout',
  metrics: ['SAPI7_post_checkout'],
  thresholds: {
    SAPI7_post_checkout: {
      smoke: ['avg<300'],
      load: ['avg<500'],
      soak: ['avg<500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixtureConfig = {
  customerCount: EnvironmentUtil.getTestType() === 'soak' ? EnvironmentUtil.getRampVus() : testConfiguration.vus,
  cartCount: EnvironmentUtil.getTestType() === 'soak' ? 300 : testConfiguration.iterations, // 600 is approximate number for soak test
  itemCount: 1,
  defaultItemPrice: 10000,
};

let fixture = new CheckoutFixture(fixtureConfig);

export function setup() {
  return fixture.getData();
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
