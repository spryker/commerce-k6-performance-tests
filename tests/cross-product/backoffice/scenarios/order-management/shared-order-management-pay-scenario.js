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

        this.createOrders();

        try {
            await self.adminHelper.loginBackoffice();
            sleep(1);
            await self.adminHelper.goToSalesPage();
            sleep(1);
            await self.adminHelper.openFirstSalesOrder();
            sleep(1);
            await self.adminHelper.waitForOrderHasOmsTriggerButton();
            sleep(1);
            await self.adminHelper.payForTheOrder();
            sleep(1);

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