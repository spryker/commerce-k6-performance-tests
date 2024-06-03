import Handler from '../handler.js';
import {uuid} from '../../../lib/utils.js';

export default class ShipmentHandler extends Handler {

    getTableAlias() {
        return 'shipment-methods'
    }

    setup(storeConfig) {
        let entityConfigs = [
            {
                read_entity: {
                    table: 'shipment-methods',
                    fk: 'id_shipment_method'
                },
                write_entity: {
                    table: 'shipment-method-stores',
                    fk: 'fk_shipment_method'
                },
            }
        ]
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)
        results.push(this.setShippingCosts(storeConfig))
        this.validateResponses(results)
    }

    setShippingCosts(storeConfig) {
        let existingShipmentCosts = this.getDataFromTable('shipment-method-prices')
        let existingShipments = this.getDataFromTable('shipment-methods')
        let payload = []
        let result = []
        for (const shippingMethod of existingShipments) {
            storeConfig.map((store) => {
                store.currencies.map((currencyId) => {
                    if (existingShipmentCosts.filter((el) => el.fk_currency === currencyId && el.fk_store === store.id_store
                        && el.fk_shipment_method === shippingMethod.id_shipment_method).length) {
                        return
                    }
                    payload.push(Object.fromEntries([
                        [
                            'fk_shipment_method',
                            shippingMethod.id_shipment_method
                        ],
                        [
                            'fk_store',
                            store.id_store
                        ],
                        [
                            'fk_currency',
                            currencyId
                        ],
                        [
                            'uuid',
                            uuid()
                        ],
                        [
                            'default_gross_price',
                            shippingMethod.shipment_method_key === 'free_pickup' ? 0 : 500
                        ],
                        [
                            'default_net_price',
                            shippingMethod.shipment_method_key === 'free_pickup' ? 0 : 500
                        ]
                    ]))
                })
            })
        }
        if (payload.length) {
            result.push(this.createEntities('shipment-method-prices', JSON.stringify({
                data: payload
            })))
        }

        return result
    }
}