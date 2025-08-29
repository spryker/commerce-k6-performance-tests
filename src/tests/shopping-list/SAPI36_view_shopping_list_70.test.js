// tags: smoke, load, cart, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import ShoppingListsResource from '../../resources/shopping-lists.resource';
import { ShoppingListFixture } from '../../fixtures/shopping-list.fixture';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI37',
  group: 'Shopping List',
  metrics: ['SAPI36_get_shopping_lists'],
  thresholds: {
    SAPI36_get_shopping_lists: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = new ShoppingListFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  shoppingListCount: testConfiguration.iterations,
  itemCount: 70,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, idShoppingList } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  const shoppingListsResource = new ShoppingListsResource(bearerToken);
  group(testConfiguration.group, () => {
    const response = shoppingListsResource.get(idShoppingList);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
