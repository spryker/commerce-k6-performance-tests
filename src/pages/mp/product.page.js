import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import { uuidv4 } from '../../utils/uuid.util';
import { FormData } from '../../assets/form-data';

export default class ProductPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  addAbstract() {
    const productAddUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/create-product-abstract`;
    const productAddResponse = http.get(productAddUrl, { headers: this.headers });

    addErrorToCounter(
      check(productAddResponse, {
        'Get Product Add was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productAddResponse;
  }

  submitAbstract(token) {
    const payload = this._getProductAbstractPayload(token);

    let formData = new FormData();
    formData.append('create_product_abstract_form[sku]', payload.sku);
    formData.append('create_product_abstract_form[name]', payload.name);
    formData.append('create_product_abstract_form[isSingleConcrete]', payload.isSingleConcrete);
    formData.append('create_product_abstract_form[_token]', token);

    const productAddUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/create-product-abstract`;

    let headers = this.headers;
    headers['Content-Type'] = `multipart/form-data; boundary=${formData.boundary}`;

    const productAbstractAddResponse = http.post(productAddUrl, formData.body(), { headers: headers, redirects: 0 });

    addErrorToCounter(
      check(productAbstractAddResponse, {
        'Product Add submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return { productAbstractAddResponse, payload };
  }

  addConcrete(productAbstractData) {
    const queryParams = `?sku=${productAbstractData.sku}&name=${productAbstractData.name.replaceAll(' ', '%20')}&isSingleConcrete=${productAbstractData.isSingleConcrete}`;
    const productAddUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/create-product-abstract/create-with-multi-concrete${queryParams}`;

    const productConcreteAddResponse = http.get(productAddUrl, { headers: this.headers });

    addErrorToCounter(
      check(productConcreteAddResponse, {
        'Get Product Concrete Add was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productConcreteAddResponse;
  }

  submitConcrete(productAbstractData) {
    const payload = this._getProductConcretePayload(productAbstractData.name, productAbstractData.sku);

    const formData = new FormData();
    formData.append('selectedAttributes', payload.selectedAttributes);
    formData.append('concreteProducts', payload.concreteProducts);

    const queryParams = `?sku=${productAbstractData.sku}&name=${productAbstractData.name.replaceAll(' ', '%20')}&isSingleConcrete=${productAbstractData.isSingleConcrete}`;
    const productAddUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/create-product-abstract/create-with-multi-concrete${queryParams}`;

    let headers = this.headers;
    headers['Content-Type'] = `multipart/form-data; boundary=${formData.boundary}`;

    const productAddResponse = http.post(productAddUrl, formData.body(), { headers: headers });

    addErrorToCounter(
      check(productAddResponse, {
        'Product Concrete Add submit was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productAddResponse;
  }

  update(productAbstractId) {
    const productUpdateUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-abstract?product-abstract-id=${productAbstractId}`;
    const productUpdateResponse = http.get(productUpdateUrl, { headers: this.headers });

    addErrorToCounter(
      check(productUpdateResponse, {
        'Get Product Update was successful': (r) => r.status === 200 && r.body,
      })
    );

    const productUpdateTableResponse = this.updateTableData(productAbstractId);
    const productAttributesTableResponse = this.attributesTableData(productAbstractId);
    const productConcretesTableResponse = this.concretesTableData(productAbstractId);

    const maxSubRequestDuration = Math.max(
      productUpdateTableResponse.timings.duration,
      productAttributesTableResponse.timings.duration,
      productConcretesTableResponse.timings.duration
    );

    const productUpdatePageDuration = (productUpdateResponse.timings.duration + maxSubRequestDuration) * 1.05;

    return { productUpdateResponse, productUpdatePageDuration };
  }

  tableData() {
    const productTableUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/products/table-data?page=1`;
    const productTableResponse = http.get(productTableUrl, { headers: this.headers });

    addErrorToCounter(
      check(productTableResponse, {
        'Get Product Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productTableResponse;
  }

  updateTableData(productAbstractId) {
    const productUpdateUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-abstract/table-data?idProductAbstract=${productAbstractId}&page=1`;
    const productUpdateResponse = http.get(productUpdateUrl, { headers: this.headers });

    addErrorToCounter(
      check(productUpdateResponse, {
        'Get Product Update Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productUpdateResponse;
  }

  attributesTableData(productAbstractId) {
    const productAttributesUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/product-attributes/table-data?idProductAbstract=${productAbstractId}&page=1`;
    const productAttributesResponse = http.get(productAttributesUrl, { headers: this.headers });

    addErrorToCounter(
      check(productAttributesResponse, {
        'Get Product Update Attributes Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productAttributesResponse;
  }

  concretesTableData(productAbstractId) {
    const productConcretesUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/products-concrete/table-data?fkProductAbstract=${productAbstractId}&page=1`;
    const productConcretesResponse = http.get(productConcretesUrl, { headers: this.headers });

    addErrorToCounter(
      check(productConcretesResponse, {
        'Get Product Update Concretes Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productConcretesResponse;
  }

  submitUpdate(productAbstractId, token) {
    const payload = this._getProductAbstractUpdatePayload(token);

    let formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    const productUpdateUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-abstract?product-abstract-id=${productAbstractId}`;

    let headers = this.headers;
    headers['Content-Type'] = `multipart/form-data; boundary=${formData.boundary}`;

    const productUpdateResponse = http.post(productUpdateUrl, formData.body(), { headers: headers });

    addErrorToCounter(
      check(productUpdateResponse, {
        'Product Update submit was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productUpdateResponse;
  }

  updateConcrete(productConcreteId) {
    const productConcreteUpdateUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-concrete?product-id=${productConcreteId}`;
    const productConcreteUpdateResponse = http.get(productConcreteUpdateUrl, { headers: this.headers });

    addErrorToCounter(
      check(productConcreteUpdateResponse, {
        'Get Product Concrete Update was successful': (r) => r.status === 200 && r.body,
      })
    );

    const productConcreteUpdateDuration =
      (productConcreteUpdateResponse.timings.duration +
        Math.max(
          this.concreteTableData(productConcreteId).timings.duration,
          this.concretePriceTable(productConcreteId).timings.duration
        )) *
      1.05;

    return { productConcreteUpdateResponse, productConcreteUpdateDuration };
  }

  submitConcreteUpdate(productConcreteId, token) {
    const payload = this._getProductConcreteUpdatePayload(token);

    let formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key]);
    }

    const productConcreteUpdateUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-concrete?product-id=${productConcreteId}`;

    let headers = this.headers;
    headers['Content-Type'] = `multipart/form-data; boundary=${formData.boundary}`;

    const productConcreteUpdateResponse = http.post(productConcreteUpdateUrl, formData.body(), { headers: headers });

    addErrorToCounter(
      check(productConcreteUpdateResponse, {
        'Product Concrete Update submit was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productConcreteUpdateResponse;
  }

  concreteTableData(productConcreteId) {
    const productConcreteTableUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/product-attributes/concrete-table-data?idProductConcrete=${productConcreteId}&page=1`;
    const productConcreteTableResponse = http.get(productConcreteTableUrl, { headers: this.headers });

    addErrorToCounter(
      check(productConcreteTableResponse, {
        'Get Product Concrete Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productConcreteTableResponse;
  }

  concretePriceTable(productConcreteId) {
    const productConcretePriceUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/update-product-concrete/price-table-data?idProductConcrete=${productConcreteId}&page=1`;
    const productConcretePriceResponse = http.get(productConcretePriceUrl, { headers: this.headers });

    addErrorToCounter(
      check(productConcretePriceResponse, {
        'Get Product Concrete Price Table Data was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productConcretePriceResponse;
  }

  sendForApproval(productAbstractId) {
    const productSendForApprovalUrl = `${EnvironmentUtil.getMerchantPortalUrl()}/product-merchant-portal-gui/product-abstract-approval?approval-status=waiting_for_approval&id-product-abstract=${productAbstractId}`;
    const productSendForApprovalResponse = http.get(productSendForApprovalUrl, { headers: this.headers, redirects: 0 });

    addErrorToCounter(
      check(productSendForApprovalResponse, {
        'Send for Approval was successful': (r) => r.status === 302 && r.body,
      })
    );

    return productSendForApprovalResponse;
  }

  _getProductAbstractPayload() {
    return {
      sku: this._getProductSku(),
      name: this._getProductName(),
      isSingleConcrete: '0',
    };
  }

  _getProductConcretePayload(name, sku) {
    return {
      selectedAttributes: [
        {
          name: 'value',
          value: 'value',
          attributes: [
            { name: '10', value: '10' },
            { name: '20', value: '20' },
            { name: '30', value: '30' },
            { name: '50', value: '50' },
            { name: '100', value: '100' },
            { name: '150', value: '150' },
            { name: '200', value: '200' },
            { name: '250', value: '250' },
            { name: '500', value: '500' },
            { name: '1000', value: '1000' },
          ],
        },
      ],
      concreteProducts: [
        {
          name: name,
          sku: sku + '-1',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '10', value: '10' } }],
        },
        {
          name: name,
          sku: sku + '-2',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '20', value: '20' } }],
        },
        {
          name: name,
          sku: sku + '-3',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '30', value: '30' } }],
        },
        {
          name: name,
          sku: sku + '-4',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '50', value: '50' } }],
        },
        {
          name: name,
          sku: sku + '-5',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '100', value: '100' } }],
        },
        {
          name: name,
          sku: sku + '-6',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '150', value: '150' } }],
        },
        {
          name: name,
          sku: sku + '-7',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '200', value: '200' } }],
        },
        {
          name: name,
          sku: sku + '-8',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '250', value: '250' } }],
        },
        {
          name: name,
          sku: sku + '-9',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '500', value: '500' } }],
        },
        {
          name: name,
          sku: sku + '-10',
          superAttributes: [{ name: 'value', value: 'value', attribute: { name: '1000', value: '1000' } }],
        },
      ],
    };
  }

  _getProductAbstractUpdatePayload(token) {
    return {
      'productAbstract[localizedAttributes][0][name]': 'Product',
      'productAbstract[localizedAttributes][1][name]': 'Product',
      'productAbstract[localizedAttributes][0][description]': 'k6 test',
      'productAbstract[localizedAttributes][1][description]': 'k6 test',
      'productAbstract[stores][0]': '1',
      'productAbstract[stores][1]': '2',
      'productAbstract[prices]':
        '[{"editableNewRow":true,"idMerchantRelationship":"","store":1,"currency":93,"default[moneyValue][netAmount]":"","default[moneyValue][grossAmount]":"111","original[moneyValue][netAmount]":"","original[moneyValue][grossAmount]":"","volumeQuantity":1}]',
      'productAbstract[idTaxSet]': '1',
      'productAbstract[imageSetsFront][0][0][name]': 'default',
      'productAbstract[imageSetsFront][0][0][originalIndex]': 'undefined',
      'productAbstract[imageSetsFront][0][0][productImages][0][sortOrder]': '1',
      'productAbstract[imageSetsFront][0][0][productImages][0][externalUrlSmall]':
        'https://images.icecat.biz/img/norm/medium/25904006-8438.jpg',
      'productAbstract[imageSetsFront][0][0][productImages][0][externalUrlLarge]':
        'https://images.icecat.biz/img/norm/high/25904006-8438.jpg',
      'productAbstract[imageSetsFront][0][idLocale]': '0',
      'productAbstract[imageSetsFront][0][localeName]': 'Default',
      'productAbstract[imageSetsFront][1][idLocale]': '46',
      'productAbstract[imageSetsFront][1][localeName]': 'de_DE',
      'productAbstract[imageSetsFront][2][idLocale]': '66',
      'productAbstract[imageSetsFront][2][localeName]': 'en_US',
      'productAbstract[attributes]': '[{"editableNewRow":true,"attribute_name":"brand","attribute_default":"Canon"}]',
      'productAbstract[categoryIds][]': '2',
      'productAbstract[localizedAttributes][0][metaTitle]': 'seo title',
      'productAbstract[localizedAttributes][0][metaKeywords]': 'seo keywords',
      'productAbstract[localizedAttributes][0][metaDescription]': 'seo description',
      'productAbstract[localizedAttributes][1][metaTitle]': 'seo title',
      'productAbstract[localizedAttributes][1][metaKeywords]': 'seo keywords',
      'productAbstract[localizedAttributes][1][metaDescription]': 'seo description',
      'productAbstract[localizedAttributes][0][locale]': '46',
      'productAbstract[localizedAttributes][1][locale]': '66',
      'productAbstract[_token]': token,
    };
  }

  _getProductConcreteUpdatePayload(token) {
    return {
      'productConcreteEdit[productConcrete][attributes]': [],
      'productConcreteEdit[_token]': token,
      'productConcreteEdit[productConcrete][isActive]': 'on',
      'productConcreteEdit[productConcrete][stocks][quantity]': '0',
      'productConcreteEdit[productConcrete][localizedAttributes][0][name]': 'Product k6 test',
      'productConcreteEdit[productConcrete][localizedAttributes][1][name]': 'Product k6 test',
      'productConcreteEdit[productConcrete][localizedAttributes][0][description]': '',
      'productConcreteEdit[productConcrete][localizedAttributes][0][locale]': '46',
      'productConcreteEdit[productConcrete][localizedAttributes][1][description]': '',
      'productConcreteEdit[productConcrete][localizedAttributes][1][locale]': '66',
      'productConcreteEdit[productConcrete][validFrom]': '',
      'productConcreteEdit[productConcrete][validTo]': '',
      'productConcreteEdit[useAbstractProductPrices]': 'on',
      'productConcreteEdit[productConcrete][prices]': [],
      'productConcreteEdit[productConcrete][imageSetsFront][0][idLocale]': '0',
      'productConcreteEdit[productConcrete][imageSetsFront][0][localeName]': 'Default',
      'productConcreteEdit[productConcrete][imageSetsFront][1][idLocale]': '46',
      'productConcreteEdit[productConcrete][imageSetsFront][1][localeName]': 'de_DE',
      'productConcreteEdit[productConcrete][imageSetsFront][2][idLocale]': '66',
      'productConcreteEdit[productConcrete][imageSetsFront][2][localeName]': 'en_US',
    };
  }

  _getProductName() {
    return 'Product #' + uuidv4();
  }

  _getProductSku() {
    return 'SKU-' + uuidv4();
  }
}
