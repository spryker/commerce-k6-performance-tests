import AbstractPage from '../abstract.page';
import EnvironmentUtil from '../../utils/environment.util';
import { check } from 'k6';
import { addErrorToCounter } from '../../utils/metric.util';
import KSixError from '../../utils/k-six-error';

export default class CheckoutPage extends AbstractPage {
  constructor(page) {
    super();
    this.page = page;
    this.addressSubmitButtonSelector = '[name="addressesForm"] button[type="submit"]';
    this.shipmentSubmitButtonSelector = '[name="shipmentCollectionForm"] button[type="submit"]';
    this.paymentSubmitButtonSelector = '[name="paymentForm"] button[type="submit"]';
    this.checkoutButtonSelector = '[name="summaryForm"] button.form__action';
    this.header = page.locator('h1');
    this.headerSuccessPage = page.locator('h3');
    this.shipmentMethodRadioButtonSelector = '[name="shipmentCollectionForm"] label > span.radio__label';
    this.paymentMethodRadioButtonSelector = '[name="paymentForm"] label > span.toggler-radio__label';
    this.paymentDateOfBirthInputSelector = '[name="paymentForm[dummyPaymentInvoice][date_of_birth]"]';
    this.acceptTermsCheckboxSelector = '#summaryForm_acceptTermsAndConditions .checkbox__box';
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
    await paymentMethodRadioButtons[1].click();
  }

  async fillPaymentInput() {
    await this.page.waitForSelector(this.paymentDateOfBirthInputSelector);
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

  async acceptTerms() {
    const acceptTermsCheckbox = await this.page.locator(this.acceptTermsCheckboxSelector);
    await acceptTermsCheckbox.click();
  }

  async submitSummaryForm() {
    const checkoutButton = await this.page.locator(this.checkoutButtonSelector);
    await Promise.all([this.page.waitForNavigation(), checkoutButton.click()]);

    await this.headerSuccessPage.waitFor();
    const headerText = await this.headerSuccessPage.textContent();

    addErrorToCounter(
      check(headerText, {
        'Checkout was submitted': (text) => text === 'Your order has been placed successfully!',
      })
    );
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

  async getNavigationTime() {
    const navigationEntries = await this.page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')))
    );

    if (navigationEntries.length > 0) {
      return navigationEntries[0].responseEnd - navigationEntries[0].requestStart;
    }
  }
}
