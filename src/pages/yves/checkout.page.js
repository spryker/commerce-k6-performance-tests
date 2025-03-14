import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import http from 'k6/http';
import KSixError from '../../utils/k-six-error';

export default class CheckoutPage extends AbstractPage {
  constructor(page) {
    super();
    this.page = page;
    this.addressSubmitButtonSelector = '[name="addressesForm"] button[type="submit"]';
    this.shipmentSubmitButtonSelector = '[name="shipmentCollectionForm"] button[type="submit"]';
    this.paymentSubmitButtonSelector = '[name="paymentForm"] button[type="submit"]';
    this.header = page.locator('h1');
    this.shipmentMethodRadioButtonSelector = '[name="shipmentCollectionForm"] label > span.radio__label';
    this.paymentMethodRadioButtonSelector = '[name="paymentForm"] label > span.toggler-radio__label';
    this.paymentDateOfBirthInputSelector = '[name="paymentForm[dummyPaymentInvoice][date_of_birth]"]';
  }

  async navigate() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/checkout`);
  }

  async navigateToAddress() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/checkout/address`);
  }

  async navigateToShipment() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/checkout/shipment`);
  }

  async navigateToPayment() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/checkout/payment`);
  }

  async navigateToSummary() {
    await this.page.goto(`${EnvironmentUtil.getStorefrontUrl()}/checkout/summary`);
  }

  async submitAddressForm() {
    const addressSubmitButton = await this.page.locator(this.addressSubmitButtonSelector);
    await Promise.all([this.page.waitForNavigation(), addressSubmitButton.click()]);

    await this.header.waitFor();
    const headerText = await this.header.textContent();

    addErrorToCounter(
      check(headerText, {
        'Address was submitted': (text) => text === 'Shipment',
      })
    );
  }

  async selectShipmentOption() {
    const shipmentMethodRadioButtons = await this.page.$$(this.shipmentMethodRadioButtonSelector);
    await shipmentMethodRadioButtons[0].click();
  }

  async selectPaymentOption() {
    const paymentMethodRadioButtons = await this.page.$$(this.paymentMethodRadioButtonSelector);
    await Promise.all([
      this.page.waitForSelector(this.paymentDateOfBirthInputSelector, { timeout: 5000 }),
      paymentMethodRadioButtons[1].click(),
    ]);
  }

  async fillPaymentInput() {
    const paymentDateOfBirthInput = await this.page.locator(this.paymentDateOfBirthInputSelector);
    await paymentDateOfBirthInput.fill('01.01.2000');
  }

  async submitShipmentForm() {
    const shipmentSubmitButton = await this.page.locator(this.shipmentSubmitButtonSelector);
    await Promise.all([this.page.waitForNavigation(), shipmentSubmitButton.click()]);

    await this.header.waitFor();
    const headerText = await this.header.textContent();

    addErrorToCounter(
      check(headerText, {
        'Shipment was submitted': (text) => text === 'Payment',
      })
    );
  }

  async submitPaymentForm() {
    const paymentSubmitButton = await this.page.locator(this.paymentSubmitButtonSelector);
    await Promise.all([this.page.waitForNavigation(), paymentSubmitButton.click()]);

    await this.header.waitFor();
    const headerText = await this.header.textContent();

    addErrorToCounter(
      check(headerText, {
        'Payment was submitted': (text) => text === 'Summary',
      })
    );
  }

  async placeOrder() {
    const summaryFormTokenInput = await this.page.locator('input[name="summaryForm[_token]"]');
    const summaryFormToken = await summaryFormTokenInput.inputValue();

    const contextCookies = await this.page.context().cookies();
    const cookies = contextCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
    };

    const payload = {
      'summaryForm[_token]': summaryFormToken,
      acceptTermsAndConditions: 1,
    };

    const response = http.post(`${EnvironmentUtil.getStorefrontUrl()}/checkout/summary`, payload, {
      headers: headers,
      redirects: 0,
    });

    const placeOrderLocation = response.headers['Location'];
    headers = {
      Cookie: cookies,
    };

    const placeOrderResponse = http.get(`${EnvironmentUtil.getStorefrontUrl()}${placeOrderLocation}`, {
      headers: headers,
      redirects: 0,
    });

    const checkoutSuccessResponse = http.get(`${EnvironmentUtil.getStorefrontUrl()}/checkout/success`, {
      headers: headers,
    });

    return {
      placeOrderDurationTime: placeOrderResponse.timings.duration,
      successPageDurationTime: checkoutSuccessResponse.timings.duration,
    };
  }

  async getDurationTime() {
    await this.page.evaluate(() => window.performance.mark('page-visit'));
    const marks = await this.page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('mark')))
    );

    if (marks.length > 0) {
      return marks[0].startTime;
    }

    throw new KSixError('No marks found');
  }
}
