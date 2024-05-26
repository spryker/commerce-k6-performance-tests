import Handler from "../handler.js";

export default class ShipmentHandler extends Handler {

    getTableAlias() {
        return 'shipment-methods'
    }

    setup(storeConfig) {
        let entityConfigs = [
            {
                entity: {
                    table: 'shipment-methods',
                    fk: 'id_shipment_method'
                },
                entity_store: {
                    table: 'shipment-method-stores',
                    fk: 'fk_shipment_method'
                },
            }
        ]
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)

        this.validateResponses(results)
    }
}