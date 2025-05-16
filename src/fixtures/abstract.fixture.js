import http from 'k6/http';
import { check } from 'k6';
import EnvironmentUtil from '../utils/environment.util';
import { addErrorToCounter } from '../utils/metric.util';

export class AbstractFixture {
  static DEFAULT_LOCALE_ID = 66;
  static DEFAULT_LOCALE_NAME = 'en_US';
  static DEFAULT_STORE_ID = 1;
  static DEFAULT_STORE_NAME = 'DE';
  static DEFAULT_IMAGE_SMALL = 'https://images.icecat.biz/img/gallery_mediums/30691822_1486.jpg';
  static DEFAULT_IMAGE_LARGE = 'https://images.icecat.biz/img/gallery/30691822_1486.jpg';
  static DEFAULT_PASSWORD = 'change123';
  static DEFAULT_STOCK_ID = 1;
  static DEFAULT_STOCK_NAME = 'Warehouse1';
  static DEFAULT_MERCHANT_REFERENCE = 'MER000008';
  static DEFAULT_TAX_SET_ID = 1;
  static DEFAULT_PRODUCT_URL_PREFIX = 'en-us';
  static DEFAULT_LOCALE = 'de_DE';
  static DEFAULT_CURRENCY_CODE = 'EUR';
  static DEFAULT_PARENT_CATEGORY_NODE = 0;

  static shouldUseStaticFixtures() {
    return EnvironmentUtil.getUseStaticFixtures() && EnvironmentUtil.getTestType() === 'soak';
  }

  runDynamicFixture(payload) {
    const res = http.post(http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`, payload, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });

    addErrorToCounter(check(res, { 'Fixtures generated successfully.': (r) => r.status === 201 }));

    return res;
  }

  static runConsoleCommands(commands) {
    const operations = commands.map((command) => {
      return {
        type: 'cli-command',
        name: command,
      };
    });

    const payload = {
      data: {
        type: 'dynamic-fixtures',
        attributes: {
          operations: operations,
        },
      },
    };

    return http.post(http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`, payload, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
  }
}
