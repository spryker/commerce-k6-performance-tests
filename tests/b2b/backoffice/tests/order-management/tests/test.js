// this file is only for testing custom scripts
import { browser } from 'k6/browser';

export const options = {
    scenarios: {
        default: {
            executor: 'per-vu-iterations',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
};

export default async function () {
    console.log('Opening a new browser context');
    const context = await browser.newContext();
    console.log('Opening a new page');
    const page = await context.newPage();

    // Listen to browser console messages
    page.on('console', (msg) => console.log(`[Browser Console]: ${msg.type()}: ${msg.text()}`));

    try {
        // Navigate to login page
        await page.goto('http://backoffice.eu.spryker.local/security-gui/login');
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

        // Login actions
        await page.locator('input[name="auth[username]"]').fill('admin@spryker.com');
        await page.locator('input[name="auth[password]"]').fill('change123');
        await page.locator('form[name="auth"] button[type="submit"]').click();
        await page.screenshot({ path: 'results/screenshot.png' });

        // Navigate to sales page
        await page.goto('http://backoffice.eu.spryker.local/sales');
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.screenshot({ path: 'results/sales.png' });

        // Navigate to sales details page
        await page.locator('.dataTable tbody tr:nth-child(1) .btn-view').click();
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.screenshot({ path: 'results/sales-detail.png' });

        console.log('Triggering the ship event');

        // Custom retry logic for waiting and clicking the button
        const buttonLocator = page.locator('#oms_trigger_form_submit');
        let retries = 0;
        let maxRetries = 5;

        while (retries < maxRetries) {
            try {
                console.log(`Checking for the button (attempt ${retries + 1})...`);

                // Wait for the button to be present in the DOM
                await buttonLocator.waitFor({ state: 'attached', timeout: 5000 });
                console.log('Button is present in the DOM.');

                // Check if button is visible and interactable
                const isVisible = await buttonLocator.isVisible();
                if (isVisible) {
                    console.log('Button is visible, attempting to click...');
                    await buttonLocator.click();
                    console.log('Button clicked!');
                    break; // Exit retry loop if successful
                } else {
                    console.log('Button is not visible. Retrying...');
                }
            } catch (error) {
                console.log('Error interacting with the button:', error.message);
            }

            // Increment retry count and delay between retries
            retries++;
            if (retries < maxRetries) {
                console.log('Retrying in 2 seconds...');
                await page.waitForTimeout(2000);
            } else {
                throw new Error('Max retries reached, button not clickable');
            }
        }

        // Wait for network to be idle after the action
        console.log('Waiting for the network to be idle');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await page.screenshot({ path: 'results/sales-detail-oms.png' });
    } catch (error) {
        console.error(
            'Error during page operations:',
            error.stack || error.message || JSON.stringify(error, null, 2)
        );
    } finally {
        if (page) {
            await page.close();
        }
        if (context) {
            await context.close();
        }
    }
}