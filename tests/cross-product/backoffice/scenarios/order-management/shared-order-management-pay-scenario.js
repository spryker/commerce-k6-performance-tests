import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';
import http from 'k6/http';

export class SharedOrderManagementPayScenario extends AbstractScenario {
    constructor(environment, checkoutScenario) {
        super(environment);
        this.checkoutScenario = checkoutScenario;
        this.ordersCreated = false;
    }

    createOrders() {
        let self = this;

        group('Create Order', function () {
            self.checkoutScenario.execute(1);
        });

        this.ordersCreated = true;
    }

    execute() {
        let self = this;

        if (!this.ordersCreated) {
            this.createOrders();
        }

        group('Pay Order', function () {
            self.adminHelper.initBrowser();
            self.adminHelper.loginBackoffice();

            self.adminHelper.goToSalesPage();
            self.adminHelper.openFirstSalesOrder();

            //
            // const salesResponse = http.get(`${self.urlHelper.getBackofficeBaseUrl()}/sales`);
            // self.assertionsHelper.assertResponseStatus(salesResponse, 200);
            //
            // const salesTableResponse = http.get(`${self.urlHelper.getBackofficeBaseUrl()}/sales/index/table?length=25`);
            // self.assertionsHelper.assertResponseStatus(salesTableResponse, 200);
            //
            // let endTime = new Date().getTime();
            // let totalElapsedTime = endTime - startTime;
            //
            // TotalResponseTime.add(totalElapsedTime);
        });
    }
}