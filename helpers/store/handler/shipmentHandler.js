import Handler from "../handler.js";

export default class ShipmentHandler extends Handler {

    getTableAlias() {
        return 'shipment-methods'
    }

    setup(storeConfig) {
        let data = this.getDataFromTable(this.getTableAlias())
        let activeShipments = data.filter((shipment) => shipment.is_active)
        let shipmentStores =  this.getDataFromTable('shipment-method-stores')

        let payload = []
        storeConfig.map((store) => {
            activeShipments.map((shipment) => {
                if (shipmentStores.filter((el) => el.fk_shipment_method === shipment.id_shipment_method && el.fk_store === store.id_store).length) {
                    return
                }

                payload.push({
                    fk_shipment_method: shipment.id_shipment_method,
                    fk_store: store.id_store
                })
            })
        })

        if (payload.length) {
            return this.createEntities('shipment-method-stores', JSON.stringify({
                data: payload
            }))
        }
    }
}