// tags: smoke, load, discount, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import { CartFixture } from '../../fixtures/cart.fixture';
import { VoucherFixture } from '../../fixtures/voucher.fixture';
import CartVouchersResource from '../../resources/cart-vouchers.resource';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI41',
  group: 'Discount',
  metrics: ['SAPI41_post_vouchers'],
  thresholds: {
    SAPI41_post_vouchers: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new CartFixture({
  customerCount: testConfiguration.vus,
  cartCount: testConfiguration.iterations,
  itemCount: 70,
});
const voucherFixture = new VoucherFixture({ discountCount: 1 });

export function setup() {
  let data = fixture.getData();
  const discount = voucherFixture.getData();

  data.forEach((index) => {
    index.discount = discount;
  });

  return data;
}

export default function (data) {
  const { customerEmail, idCart, voucherCode } = iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  group(testConfiguration.group, () => {
    const cartVouchersResource = new CartVouchersResource(bearerToken);
    const response = cartVouchersResource.addVoucher(idCart, voucherCode);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}

function iterateData(data, vus = exec.vu.idInTest, iterations = exec.vu.iterationInScenario) {
  const customerIndex = (vus - 1) % data.length;
  const { customerEmail, cartIds, productSkus, discount } = data[customerIndex];
  const cartIndex = iterations % cartIds.length;
  const product = productSkus[0];

  return {
    customerEmail,
    idCart: cartIds[cartIndex],
    productSku: product,
    voucherCode: discount[0].code,
  };
}
