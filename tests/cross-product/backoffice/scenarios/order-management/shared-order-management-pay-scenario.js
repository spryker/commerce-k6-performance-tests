import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group, sleep } from 'k6';

export class SharedOrderManagementPayScenario extends AbstractScenario {
    constructor(environment, checkoutScenario) {
        super(environment);
        this.checkoutScenario = checkoutScenario;
    }

    createOrders() {
        let self = this;

        group('Create Order', function () {
            self.checkoutScenario.execute(1);
        });
    }

    async execute() {
        let self = this;

        // this.createOrders();
        try {
            console.log('before loginBackoffice');
            await self.adminHelper.loginBackoffice();
            console.log('after loginBackoffice');
            self.adminHelper.takeScreenshot();
            sleep(1);
            console.log('before goToSalesPage');
            await self.adminHelper.goToSalesPage();
            console.log('after goToSalesPage');
            await self.adminHelper.takeScreenshot();
            sleep(1);
            console.log('before openFirstSalesOrder');
            await self.adminHelper.openFirstSalesOrder();
            console.log('after openFirstSalesOrder');
            await self.adminHelper.takeScreenshot();
            sleep(1);
            console.log('before waitForOrderHasOmsTriggerButton');
            await self.adminHelper.waitForOrderHasOmsTriggerButton();
            console.log('after waitForOrderHasOmsTriggerButton');
            sleep(1);
            console.log('before payForTheOrder');
            await self.adminHelper.payForTheOrder();
            console.log('after payForTheOrder');
        } catch (error) {
            console.log(error);
            self.adminHelper.takeScreenshot('error.png');
        } finally {
            const context = self.adminHelper.contextStorage.getContext();
            await self.adminHelper.contextStorage.getPage().close();
            await context.close();
        }
    }
}