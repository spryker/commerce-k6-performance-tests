// tags: smoke, load, soak, product-search, SAPI
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import CatalogSearchResource from '../../resources/catalog-search.resource';
import { FullProductFixture } from '../../fixtures/full-product.fixture';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SAPI2',
  group: 'Product Search',
  metrics: ['SAPI2_get_catalog_search'],
  thresholds: {
    SAPI2_get_catalog_search: {
      smoke: ['avg<400'],
      load: ['avg<800'],
      soak: ['avg<800'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = FullProductFixture.createFixture({
  productCount: testConfiguration.vus ?? EnvironmentUtil.getRampVus(),
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const product = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const catalogSearchResource = new CatalogSearchResource();
    const response = catalogSearchResource.get({ q: product.sku });

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
