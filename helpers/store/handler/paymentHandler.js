import Handler from "../handler.js";

export default class PaymentHandler extends Handler {

    getTableAlias() {
        return 'payment-methods'
    }

    setup(storeConfig) {
        let entityConfigs = [
            {
                entity: {
                    table: 'payment-methods',
                    fk: 'id_payment_method'
                },
                entity_store: {
                    table: 'payment-method-stores',
                    fk: 'fk_payment_method'
                },
            }
        ]
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)

        this.validateResponses(results)
    }
}