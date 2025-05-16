// tags: smoke, load
import { group } from 'k6';
import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { LoginPage } from '../../pages/mp/login.page';
import ProductPage from '../../pages/mp/product.page';
import { parseHTML } from 'k6/html';
import exec from 'k6/execution';

if (EnvironmentUtil.getRepositoryId() === 'b2b') {
  exec.test.abort('Merchant Portal is not integrated into b2b demo shop.');
}

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'M4',
  group: 'Product management',
  metrics: [
    'M4_get_abstract_create',
    'M4_post_abstract_create',
    'M4_get_concrete_create',
    'M4_post_concrete_create',
    'M4_get_abstract_update',
    'M4_post_abstract_update',
    'M4_get_concrete_update',
    'M4_post_concrete_update',
    'M4_send_for_approval',
  ],
  vus: 1,
  iterations: 10,
  thresholds: {
    M4_get_abstract_create: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_post_abstract_create: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_get_concrete_create: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_post_concrete_create: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_get_abstract_update: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_post_abstract_update: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_get_concrete_update: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_post_concrete_update: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
    M4_send_for_approval: {
      smoke: ['avg<700'],
      load: ['avg<1400'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export default function () {
  let headers = {};
  group('Login', () => {
    const loginPage = new LoginPage();
    headers = loginPage.login();
  });

  const productPage = new ProductPage(headers);
  let productAbstractFormToken;
  group('Get Product Abstract Add', () => {
    const productPageResponse = productPage.addAbstract();
    productAbstractFormToken = parseHTML(formattedHtml(JSON.parse(productPageResponse.body).form))
      .find('#create_product_abstract_form__token')
      .attr('value');

    metrics['M4_get_abstract_create'].add(productPageResponse.timings.duration);
  });

  let productAbstractData;
  group('Product Abstract Submit', () => {
    const { productAbstractAddResponse, payload } = productPage.submitAbstract(productAbstractFormToken);
    productAbstractData = payload;
    metrics['M4_post_abstract_create'].add(productAbstractAddResponse.timings.duration);
  });

  group('Get Product Concrete Add', () => {
    const productConcretePageResponse = productPage.addConcrete(productAbstractData);
    metrics['M4_get_concrete_create'].add(productConcretePageResponse.timings.duration);
  });

  group('Submit Product Concrete Add', () => {
    const productConcretePageResponse = productPage.submitConcrete(productAbstractData);
    metrics['M4_post_concrete_create'].add(productConcretePageResponse.timings.duration);
  });

  const tableData = JSON.parse(productPage.tableData().body).data;
  const productAbstractId = tableData[0].idProductAbstract;
  let productAbstractUpdateFormToken;
  group('Get Product Update', () => {
    const { productUpdateResponse, productUpdatePageDuration } = productPage.update(productAbstractId);
    productAbstractUpdateFormToken = parseHTML(formattedHtml(JSON.parse(productUpdateResponse.body).form))
      .find('#productAbstract__token')
      .attr('value');

    metrics['M4_get_abstract_update'].add(productUpdatePageDuration);
  });

  group('Update Product Abstract', () => {
    const productAbstractUpdateResponse = productPage.submitUpdate(productAbstractId, productAbstractUpdateFormToken);
    metrics['M4_post_abstract_update'].add(productAbstractUpdateResponse.timings.duration);
  });

  const productConcreteTableData = JSON.parse(productPage.concretesTableData(productAbstractId).body).data;
  const productConcreteId = productConcreteTableData[0].idProductConcrete;
  let productConcreteUpdateFormToken;
  group('Get Product Concrete Update', () => {
    const { productConcreteUpdateResponse, productConcreteUpdateDuration } =
      productPage.updateConcrete(productConcreteId);
    productConcreteUpdateFormToken = parseHTML(formattedHtml(JSON.parse(productConcreteUpdateResponse.body).form))
      .find('#productConcreteEdit__token')
      .attr('value');

    metrics['M4_get_concrete_update'].add(productConcreteUpdateDuration);
  });

  group('Update Product Concrete', () => {
    const productConcreteUpdateResponse = productPage.submitConcreteUpdate(
      productConcreteId,
      productConcreteUpdateFormToken
    );

    metrics['M4_post_concrete_update'].add(productConcreteUpdateResponse.timings.duration);
  });

  group('Send for Approval', () => {
    const productSendForApprovalResponse = productPage.sendForApproval(productAbstractId);
    metrics['M4_send_for_approval'].add(productSendForApprovalResponse.timings.duration);
  });
}

function formattedHtml(str) {
  return str
    .replace(/\\u003C/g, '<')
    .replace(/\\u003E/g, '>')
    .replace(/\\u0022/g, '"')
    .replace(/\\u0026quot;/g, '&quot;')
    .replace(/\\u0026/g, '&')
    .replace(/\\u0027/g, "'") // eslint-disable-line
    .replace(/\\u005C/g, '\\')
    .replace(/\\u002F/g, '/')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\//g, '/')
    .replace(/\\'/g, "'") // eslint-disable-line
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
