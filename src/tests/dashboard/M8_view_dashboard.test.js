import {group} from 'k6';
import OptionsUtil from '../../utils/options.util';
import {createMetrics} from '../../utils/metric.util';
import {check} from 'k6';
import EnvironmentUtil from '../../utils/environment.util';
import {MerchantUserFixture} from "../../fixtures/merchant-user.fixture";
import {browser} from 'k6/browser';

const testConfiguration = {
    ...EnvironmentUtil.getDefaultTestConfiguration(),
    id: 'M8',
    group: 'Dashboard',
    vus: 1,
    iterations: 10,
    metrics: ['M8_view_dashboard'],
    thresholds: {
        M8_view_dashboard: {
            smoke: ['avg<475'],
            load: ['avg<475'],
        },
    },
};

const {metrics, metricThresholds} = createMetrics(testConfiguration);
export const options = OptionsUtil.loadOptions(testConfiguration, metricThresholds);

export function setup() {
    const dynamicFixture = new MerchantUserFixture({
        idMerchant: 1,
        merchantUserCount: testConfiguration.vus,
    });

    return dynamicFixture.getData();
}

async function login(merchantUser) {
    const browserContext = await browser.newContext(); // Create browser context
    const page = await browserContext.newPage(); // Create a new page in the context

    try {
        // Navigate to login page
        await page.goto(`${EnvironmentUtil.getMerchantPortalUrl()}/security-merchant-portal-gui/login`);

        // Fill in login credentials
        await page.locator('#security-merchant-portal-gui_username').type(merchantUser.username);
        await page.locator('#security-merchant-portal-gui_password').type(merchantUser.password);

        // Submit the form
        const submitButton = page.locator('[name="security-merchant-portal-gui"] button[type="submit"]');
        await Promise.all([
            page.waitForNavigation(), // Wait for navigation to complete
            submitButton.click(), // Click the submit button
        ]);

        // Ensure the header is loaded
        const header = page.locator('h1');
        await header.waitFor(); // Wait for the header to appear

        // Validate the header text
        const headerText = await header.textContent();
        check(headerText, {
            'Header text is correct': (text) => text === 'Dashboard',
        });

        return browserContext; // Return the browser context for reuse
    } catch (error) {
        console.error('Error during login:', error);
        throw error; // Rethrow error for debugging
    } finally {
        await page.close(); // Always close the page
    }
}

export default async function (data) {
    const merchantUser = MerchantUserFixture.iterateData(data);
    const context = await login(merchantUser);

    group(testConfiguration.group, async () => {
        const page = await context.newPage();

        try {
            await page.goto(`${EnvironmentUtil.getMerchantPortalUrl()}/dashboard-merchant-portal-gui/dashboard`);
            // Wait for the page to load completely
            await page.waitForLoadState('load');

            // Record a performance mark
            await page.evaluate(() => window.performance.mark('page-visit'));

            // Retrieve performance marks
            const marks = await page.evaluate(() =>
                JSON.parse(JSON.stringify(window.performance.getEntriesByType('mark')))
            );

            if (marks.length > 0) {
                const totalActionTime = marks[0].startTime; // Use startTime of the first mark
                metrics[testConfiguration.metrics[0]].add(totalActionTime);
            }
        } finally {
            await page.close(); // Close the page after use
        }
    });

    await context.close(); // Close context after the test
}
