import http from 'k6/http';
import { check, sleep } from 'k6';
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
  static DEFAULT_MERCHANT_REFERENCE = 'MER000001';
  static DEFAULT_TAX_SET_ID = 1;
  static DEFAULT_PRODUCT_URL_PREFIX = 'en-us';
  static DEFAULT_LOCALE = 'de_DE';
  static DEFAULT_CURRENCY_CODE = 'EUR';
  static DEFAULT_PRODUCT_LABEL = 'KSixTestLabel';
  static DEFAULT_COLORS = ['Black', 'Blue', 'White'];
  static DEFAULT_BRANDS = ['Adidas', 'Nike', 'Puma'];

  static shouldUseStaticFixtures() {
    return EnvironmentUtil.getUseStaticFixtures();
  }

  runDynamicFixture(payload) {
    // The backend occasionally kills the FPM worker on a heavy fixture request (data creation plus
    // queue processing inside one HTTP call) and responds 502; the condition clears within seconds,
    // so retry with a pause before giving up.
    //
    // 504 (gateway timeout) is deliberately NOT retried: the timed-out request keeps running
    // server-side, so a retry piles another heavy request on top (self-amplifying congestion) and
    // each attempt burns ~80s of the k6 setupTimeout budget. Failing fast keeps the error readable
    // and the env recoverable.
    const maxAttempts = 3;
    const retryDelaySeconds = 20;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        console.warn(`Dynamic fixture attempt ${attempt - 1} failed, retrying in ${retryDelaySeconds}s: ${lastError}`);
        sleep(retryDelaySeconds);
      }

      const res = http.post(http.url`${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures`, payload, {
        timeout: '300s',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      });

      // Guards against the fixture crashing later on `JSON.parse(response.body).data` with
      // "Cannot read property 'filter' of undefined". Covers both failure shapes: a non-201
      // status, and a JSON body without a `data` key (e.g. a JSON:API error envelope).
      let responseData;
      try {
        responseData = JSON.parse(res.body).data;
      } catch (e) {
        responseData = undefined;
      }

      if (res.status === 201 && responseData) {
        addErrorToCounter(check(res, { 'Fixtures generated successfully.': () => true }));

        return res;
      }

      lastError =
        `Dynamic fixture request failed: HTTP ${res.status} from ${EnvironmentUtil.getBackendApiUrl()}/dynamic-fixtures. ` +
        `Body: ${String(res.body).slice(0, 500)}`;

      if (res.status === 504) {
        break;
      }
    }

    addErrorToCounter(check(null, { 'Fixtures generated successfully.': () => false }));

    throw new Error(lastError);
  }

  getSprykerMerchantReference() {
    return EnvironmentUtil.getRepositoryId() === 'b2b-mp' ? 'MER000008' : AbstractFixture.DEFAULT_MERCHANT_REFERENCE;
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
      timeout: '300s',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
  }
}
