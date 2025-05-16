// tags: soak
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import { CmsPageFixture } from '../../fixtures/cms-page.fixture';
import CmsPagesResource from '../../resources/cms-pages.resource';
import EnvironmentUtil from "../../utils/environment.util";

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'SOAKAPI1',
  group: 'Homepage',
  metrics: ['SOAKAPI1_get_cms_pages'],
  thresholds: {
    SOAKAPI1_get_cms_pages: {
      smoke: ['avg<200'],
      load: ['avg<300'],
      soak: ['avg<300'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

const fixture = CmsPageFixture.createFixture({
  cmsPagesCount: testConfiguration.vus,
});

export function setup() {
  return fixture.getData();
}

export default function (data) {
  const { uuid } = fixture.iterateData(data);

  group(testConfiguration.group, () => {
    const cmsPagesResource = new CmsPagesResource();
    const response = cmsPagesResource.get(uuid);

    metrics[testConfiguration.metrics[0]].add(response.timings.duration);
  });
}
