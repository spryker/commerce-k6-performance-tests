import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

const numberOfOrders = 1;

export class SharedOrderManagementListScenario extends AbstractScenario {
    constructor(environment, checkoutScenario) {
        super(environment);
        this.checkoutScenario = checkoutScenario;
        this.ordersCreated = true;
    }

    async createOrders() {
        let self = this;

        group('Create Orders', function () {
            for (let i = 0; i < numberOfOrders; i++) {
                self.checkoutScenario.execute(1);
            }
        });

        this.ordersCreated = true;
    }

    async execute() {
        let self = this;

        if (!this.ordersCreated) {
            await this.createOrders();
        }

        try {
            await self.adminHelper.loginBackoffice();
            await self.adminHelper.goToSalesPage();
        } finally {
            let context = self.adminHelper.page.context();
            await self.adminHelper.page.close();
            await context.close();
        }

    }
}