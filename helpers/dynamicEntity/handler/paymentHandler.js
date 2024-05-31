import Handler from '../handler.js';

export default class PaymentHandler extends Handler {

    getTableAlias() {
        return 'payment-methods'
    }

    setup(storeConfig) {
        let entityConfigs = [
            {
                read_entity: {
                    table: 'payment-methods',
                    fk: 'id_payment_method'
                },
                write_entity: {
                    table: 'payment-method-stores',
                    fk: 'fk_payment_method'
                },
            }
        ]
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)

        this.validateResponses(results)
    }
}