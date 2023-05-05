import { AbstractScenario } from '../../../abstract-scenario.js';

export class SharedCartScenario extends AbstractScenario {
    execute() {
        const cartId = this.cartHelper.haveCartWithProducts(__ENV.numberOfItems);
        const requestParams = this.cartHelper.getParamsWithAuthorization();

        const cartResponse = this.http.sendGetRequest(
            `${this.cartHelper.getCartsUrl()}/${cartId}/?include=items`, requestParams, false
        );

        this.assertResponseStatus(cartResponse);
    }
}
