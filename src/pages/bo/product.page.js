import http from 'k6/http';
import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export default class ProductPage extends AbstractPage {
  constructor(headers = null) {
    super();
    this.headers = headers;
  }

  add() {
    const productAddUrl = `${EnvironmentUtil.getBackofficeUrl()}/product-management/add`;
    const productAddResponse = http.get(productAddUrl, { headers: this.headers });

    addErrorToCounter(
      check(productAddResponse, {
        'Get Product Add was successful': (r) => r.status === 200 && r.body,
      })
    );

    return productAddResponse;
  }

  addSubmit(token) {
    const payload = this._getProductAddPayload(token);
    const productAddUrl = `${EnvironmentUtil.getBackofficeUrl()}/product-management/add`;

    let headers = this.headers;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const productAddResponse = http.post(productAddUrl, payload, { headers: headers, redirects: 0 });

    addErrorToCounter(
      check(productAddResponse, {
        'Product Add submit was successful': (r) => r.status === 302 && r.body,
      })
    );

    return productAddResponse;
  }

  _getProductAddPayload(token) {
    const productName = this._getProductName();

    let payload = {
      'product_form_add[store_relation][id_entity]': '',
      'product_form_add[store_relation][id_stores][]': 1,
      'product_form_add[sku]': this._getProductSku(),
      'product_form_add[general_de_DE][name]': productName,
      'product_form_add[general_de_DE][description]': '',
      'product_form_add[general_en_US][name]': productName,
      'product_form_add[general_en_US][description]': '',
      'product_form_add[new_from]': '',
      'product_form_add[new_to]': '',
      'product_form_add[price_dimension][PRICE_DIMENSION_MERCHANT_RELATIONSHIP][idMerchantRelationship]': '',
      'product_form_add[prices][2-61-DEFAULT-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][2-61-DEFAULT-BOTH][moneyValue][fk_currency]': 61,
      'product_form_add[prices][2-61-DEFAULT-BOTH][moneyValue][fk_store]': 2,
      'product_form_add[prices][2-61-DEFAULT-BOTH][fk_price_type]': 1,
      'product_form_add[prices][2-61-ORIGINAL-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][2-61-ORIGINAL-BOTH][moneyValue][fk_currency]': 61,
      'product_form_add[prices][2-61-ORIGINAL-BOTH][moneyValue][fk_store]': 2,
      'product_form_add[prices][2-61-ORIGINAL-BOTH][fk_price_type]': 2,
      'product_form_add[prices][2-61-DEFAULT-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][2-61-ORIGINAL-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][2-93-DEFAULT-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][2-93-DEFAULT-BOTH][moneyValue][fk_currency]': 93,
      'product_form_add[prices][2-93-DEFAULT-BOTH][moneyValue][fk_store]': 2,
      'product_form_add[prices][2-93-DEFAULT-BOTH][fk_price_type]': 1,
      'product_form_add[prices][2-93-ORIGINAL-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][2-93-ORIGINAL-BOTH][moneyValue][fk_currency]': 93,
      'product_form_add[prices][2-93-ORIGINAL-BOTH][moneyValue][fk_store]': 2,
      'product_form_add[prices][2-93-ORIGINAL-BOTH][fk_price_type]': 2,
      'product_form_add[prices][2-93-DEFAULT-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][2-93-ORIGINAL-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][1-61-DEFAULT-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][1-61-DEFAULT-BOTH][moneyValue][fk_currency]': 61,
      'product_form_add[prices][1-61-DEFAULT-BOTH][moneyValue][fk_store]': 1,
      'product_form_add[prices][1-61-DEFAULT-BOTH][fk_price_type]': 1,
      'product_form_add[prices][1-61-ORIGINAL-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][1-61-ORIGINAL-BOTH][moneyValue][fk_currency]': 61,
      'product_form_add[prices][1-61-ORIGINAL-BOTH][moneyValue][fk_store]': 1,
      'product_form_add[prices][1-61-ORIGINAL-BOTH][fk_price_type]': 2,
      'product_form_add[prices][1-61-DEFAULT-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][1-61-ORIGINAL-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][1-93-DEFAULT-BOTH][moneyValue][gross_amount]': 999,
      'product_form_add[prices][1-93-DEFAULT-BOTH][moneyValue][fk_currency]': 93,
      'product_form_add[prices][1-93-DEFAULT-BOTH][moneyValue][fk_store]': 1,
      'product_form_add[prices][1-93-DEFAULT-BOTH][fk_price_type]': 1,
      'product_form_add[prices][1-93-ORIGINAL-BOTH][moneyValue][gross_amount]': '',
      'product_form_add[prices][1-93-ORIGINAL-BOTH][moneyValue][fk_currency]': 93,
      'product_form_add[prices][1-93-ORIGINAL-BOTH][moneyValue][fk_store]': 1,
      'product_form_add[prices][1-93-ORIGINAL-BOTH][fk_price_type]': 2,
      'product_form_add[prices][1-93-DEFAULT-BOTH][moneyValue][net_amount]': '',
      'product_form_add[prices][1-93-ORIGINAL-BOTH][moneyValue][net_amount]': '',
      'product_form_add[tax_rate]': 1,
      'product_form_add[seo_de_DE][meta_title]': '',
      'product_form_add[seo_de_DE][meta_keywords]': '',
      'product_form_add[seo_de_DE][meta_description]': '',
      'product_form_add[seo_en_US][meta_title]': '',
      'product_form_add[seo_en_US][meta_keywords]': '',
      'product_form_add[seo_en_US][meta_description]': '',
      'product_form_add[image_set_default][0][name]': 'default',
      'product_form_add[image_set_default][0][product_images][0][external_url_small]':
        'https://images.icecat.biz/img/norm/medium/25904006-8438.jpg',
      'product_form_add[image_set_default][0][product_images][0][external_url_large]':
        'https://images.icecat.biz/img/norm/high/25904006-8438.jpg',
      'product_form_add[image_set_default][0][product_images][0][id_product_image]': '',
      'product_form_add[image_set_default][0][product_images][0][fk_image_set_id]': '',
      'product_form_add[image_set_default][0][product_images][0][sort_order]': 0,
      'product_form_add[image_set_default][0][id_product_image_set]': '',
      'product_form_add[image_set_default][0][fk_locale]': '',
      'product_form_add[image_set_default][0][fk_product]': '',
      'product_form_add[image_set_default][0][fk_product_abstract]': '',
      'product_form_add[id_product_abstract]': '',
      'product_form_add[_token]': token,
    };

    for (const [key, value] of Object.entries(this._getProductFormAttributes())) {
      payload[key] = value;
    }

    return payload;
  }

  _getProductName() {
    return 'Product #' + uuidv4();
  }

  _getProductSku() {
    return 'SKU-' + uuidv4();
  }

  _getProductFormAttributes() {
    const repositoryId = EnvironmentUtil.getRepositoryId();

    switch (repositoryId) {
      case 'b2b':
        return {
          'product_form_add[attribute_super][farbe][name]': 1,
          'product_form_add[attribute_super][farbe][value][0]': 'black',
          'product_form_add[attribute_super][farbe][value][1]': 'white',
          'product_form_add[attribute_super][farbe][value][2]': 'grey',
          'product_form_add[attribute_super][farbe][value][3]': 'silver',
          'product_form_add[attribute_super][farbe][value][4]': 'blue',
          'product_form_add[attribute_super][farbe][value_hidden_id]': 1,
          'product_form_add[attribute_super][material][name]': 1,
          'product_form_add[attribute_super][material][value][0]': 'Aluminium',
          'product_form_add[attribute_super][material][value][1]': 'Stahl',
          'product_form_add[attribute_super][material][value_hidden_id]': 8,
          'product_form_add[attribute_super][bezugsfarbe][value_hidden_id]': 104,
          'product_form_add[attribute_super][packaging_unit][value_hidden_id]': 109,
          'product_form_add[attribute_super][papierformat][value_hidden_id]': 111,
          'product_form_add[attribute_super][backrest_height][value_hidden_id]': 112,
          'product_form_add[attribute_super][size][value_hidden_id]': 113,
        };
      case 'suite':
        return {
          'product_form_add[attribute_super][storage_capacity][name]': 1,
          'product_form_add[attribute_super][storage_capacity][value][0]': '64 GB',
          'product_form_add[attribute_super][storage_capacity][value][1]': '128 GB',
          'product_form_add[attribute_super][storage_capacity][value_hidden_id]': 1,
          'product_form_add[attribute_super][series][value_hidden_id]': 2,
          'product_form_add[attribute_super][total_megapixels][value_hidden_id]': 14,
          'product_form_add[attribute_super][storage_media][value_hidden_id]': 19,
          'product_form_add[attribute_super][processor_frequency][value_hidden_id]': 35,
          'product_form_add[attribute_super][processor_cache][value_hidden_id]': 38,
          'product_form_add[attribute_super][os_installed][value_hidden_id]': 45,
          'product_form_add[attribute_super][internal_memory][value_hidden_id]': 52,
          'product_form_add[attribute_super][internal_storage_capacity][value_hidden_id]': 55,
          'product_form_add[attribute_super][form_factor][value_hidden_id]': 67,
          'product_form_add[attribute_super][flash_memory][value_hidden_id]': 72,
          'product_form_add[attribute_super][color][name]': 1,
          'product_form_add[attribute_super][color][value][0]': 'black',
          'product_form_add[attribute_super][color][value][1]': 'white',
          'product_form_add[attribute_super][color][value][2]': 'grey',
          'product_form_add[attribute_super][color][value][3]': 'silver',
          'product_form_add[attribute_super][color][value][4]': 'blue',
          'product_form_add[attribute_super][color][value_hidden_id]': 87,
          'product_form_add[attribute_super][total_storage_capacity][value_hidden_id]': 107,
          'product_form_add[attribute_super][packaging_unit][value_hidden_id]': 109,
          'product_form_add[attribute_super][value][value_hidden_id]': 110,
        };
      case 'b2b-mp':
        return {};
    }
  }
}
