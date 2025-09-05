// tags: smoke, load, shopping-list, SAPI
import { group } from 'k6';
import exec from 'k6/execution';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import AuthUtil from '../../utils/auth.util';
import ShoppingListsResource from '../../resources/shopping-lists.resource';
import { CustomerFixture } from '../../fixtures/customer.fixture';

if (EnvironmentUtil.getTestType() === 'soak') {
  exec.test.abort('This test is not suitable for soak testing');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI37',
  group: 'Shopping List',
  metrics: ['SAPI37_post_shopping_lists', 'SAPI37_post_shopping_list_items', 'SAPI37_delete_shopping_lists'],
  thresholds: {
    SAPI37_post_shopping_lists: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
    SAPI37_post_shopping_list_items: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
    SAPI37_delete_shopping_lists: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = CustomerFixture.createFixture({
  customerCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
  itemCount: 1,
  isCompanyUser: true,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { customerEmail, products } = fixture.iterateData(data);

  let bearerToken;
  group('Authorization', () => {
    bearerToken = AuthUtil.getInstance().getBearerToken(customerEmail);
  });

  let idShoppingList;
  const shoppingListsResource = new ShoppingListsResource(bearerToken);
  group('Create new Shopping List', () => {
    const response = shoppingListsResource.create(`Test list ${exec.vu.iterationInScenario}`);
    const bodyJson = JSON.parse(response.body);

    idShoppingList = bodyJson.data.id;
    metrics['SAPI37_post_shopping_lists'].add(response.timings.duration);
  });

  group('Add 1 item to the list, quantity 1', () => {
    const response = shoppingListsResource.addItem(idShoppingList, products[0].sku, 1);

    metrics['SAPI37_post_shopping_list_items'].add(response.timings.duration);
  });

  group('Delete Shopping List', () => {
    const response = shoppingListsResource.delete(idShoppingList);

    metrics['SAPI37_delete_shopping_lists'].add(response.timings.duration);
  });
}
