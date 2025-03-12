import OptionsUtil from '../../utils/options.util';
import { createMetrics } from '../../utils/metric.util';
import EnvironmentUtil from '../../utils/environment.util';
import { browser } from 'k6/browser';
import { CartFixture } from '../../fixtures/cart.fixture';
import { LoginPage } from '../../pages/yves/login.page';
import CartPage from '../../pages/yves/cart.page';
import CheckoutPage from '../../pages/yves/checkout.page';

const testConfiguration = {
  ...EnvironmentUtil.getDefaultTestConfiguration(),
  id: 'S4',
  group: 'Checkout',
  metrics: [
    'S4_get_cart',
    'S4_get_checkout',
    'S4_get_checkout_address',
    'S4_get_checkout_shipment',
    'S4_get_checkout_payment',
    'S4_get_checkout_summary',
    'S4_get_checkout_success',
    'S4_get_place_order',
  ],
  thresholds: {
    S4_get_cart: {
      smoke: ['avg<600'],
      load: ['avg<1200'],
    },
    S4_get_checkout: {
      smoke: ['avg<900'],
      load: ['avg<1800'],
    },
    S4_get_checkout_address: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_checkout_shipment: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_checkout_payment: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_checkout_summary: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_place_order: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
    S4_get_checkout_success: {
      smoke: ['avg<750'],
      load: ['avg<1500'],
    },
  },
};

const { metrics, metricThresholds } = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
  const dynamicFixture = new CartFixture({
    customerCount: testConfiguration.vus,
    cartCount: testConfiguration.iterations,
    itemCount: 10,
    defaultItemPrice: 4000,
  });

  return dynamicFixture.getData();
}

export default async function (data) {
  const { customerEmail } = CartFixture.iterateData(data);
  let browserContext = await browser.newContext();

  try {
    browserContext = await login(browserContext, customerEmail);

    const cartPageDurationTime = await openCartPage(browserContext);
    metrics['S4_get_cart'].add(cartPageDurationTime);

    const checkoutPageDurationTime = await openCheckoutPage(browserContext);
    metrics['S4_get_checkout'].add(checkoutPageDurationTime);

    const checkoutAddressPageDurationTime = await processCheckoutAddressStep(browserContext);
    metrics['S4_get_checkout_address'].add(checkoutAddressPageDurationTime);

    const checkoutShipmentPageDurationTime = await processCheckoutShipmentStep(browserContext);
    metrics['S4_get_checkout_shipment'].add(checkoutShipmentPageDurationTime);

    const checkoutPaymentPageDurationTime = await processCheckoutPaymentStep(browserContext);
    metrics['S4_get_checkout_payment'].add(checkoutPaymentPageDurationTime);

    const [summaryPageDurationTime, successPageDurationTime] = await processCheckoutSummaryStep(browserContext);
    metrics['S4_get_checkout_summary'].add(summaryPageDurationTime);
    metrics['S4_get_checkout_success'].add(successPageDurationTime);
  } finally {
    await browserContext.close();
  }
}

async function login(browserContext, customerEmail) {
  const page = await browserContext.newPage({ headless: false });
  const loginPage = new LoginPage(page);

  try {
    await loginPage.navigate();
    await loginPage.login(customerEmail);

    return browserContext;
  } finally {
    await page.close();
  }
}

async function openCartPage(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const cartPage = new CartPage(page);

  try {
    await cartPage.navigate();

    return await cartPage.getDurationTime();
  } finally {
    await page.close();
  }
}

async function openCheckoutPage(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const checkoutPage = new CheckoutPage(page);

  try {
    await checkoutPage.navigate();

    return await checkoutPage.getDurationTime();
  } finally {
    await page.close();
  }
}

async function processCheckoutAddressStep(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const checkoutPage = new CheckoutPage(page);

  try {
    await checkoutPage.navigateToAddress();
    const addressPageDurationTime = await checkoutPage.getDurationTime();

    await checkoutPage.submitAddressForm();

    return addressPageDurationTime;
  } finally {
    await page.close();
  }
}

async function processCheckoutShipmentStep(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const checkoutPage = new CheckoutPage(page);

  try {
    await checkoutPage.navigateToShipment();
    const shipmentPageDurationTime = await checkoutPage.getDurationTime();

    await checkoutPage.selectShipmentOption();
    await checkoutPage.submitShipmentForm();

    return shipmentPageDurationTime;
  } finally {
    await page.close();
  }
}

async function processCheckoutPaymentStep(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const checkoutPage = new CheckoutPage(page);

  try {
    await checkoutPage.navigateToPayment();
    const paymentPageDurationTime = await checkoutPage.getDurationTime();

    await checkoutPage.selectPaymentOption();
    await checkoutPage.fillPaymentInput();
    await checkoutPage.submitPaymentForm();

    return paymentPageDurationTime;
  } finally {
    await page.close();
  }
}

async function processCheckoutSummaryStep(browserContext) {
  const page = await browserContext.newPage({ headless: false });
  const checkoutPage = new CheckoutPage(page);

  try {
    await checkoutPage.navigateToSummary();
    const summaryPageDurationTime = await checkoutPage.getDurationTime();

    await checkoutPage.acceptTerms();
    await checkoutPage.submitSummaryForm();
    const successPageDurationTime = await checkoutPage.getNavigationTime();

    return [summaryPageDurationTime, successPageDurationTime];
  } finally {
    await page.close();
  }
}
