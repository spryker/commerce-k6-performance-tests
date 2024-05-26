import Handler from "../handler.js";
import {uuid} from "../../../lib/utils.js";

export default class StockHandler extends Handler {
    getTableAlias() {
       return 'stocks'
    }

    get() {
        let stockInfo = this.getDataFromTable(this.getTableAlias())
        let targetStock = stockInfo.filter((warehouse) => warehouse.name === 'DmsWarehouse')

        return targetStock.length ? (targetStock.shift()).id_stock : null
    }

    setup(storeConfig) {
        let targetStockId = this.get()
        if (targetStockId) {
            this.assignStoresToStock(targetStockId, storeConfig)
            return
        }

        let creationResult = this.createEntities(this.getTableAlias(), JSON.stringify({
            data: [{
                is_active: true,
                name: "DmsWarehouse",
            }]
        }))

        let response = JSON.parse(creationResult.body)
        let targetWarehouseId = (response.data.shift()).id_stock
        this.assignStoresToStock(targetWarehouseId, storeConfig)
    }

    assignStoresToStock(targetWarehouseId, storeConfig) {
        let stockStores =  this.getDataFromTable('stock-stores')

        let payload = []
        storeConfig.map((store) => {
            if (stockStores.filter((el) => el.fk_stock === targetWarehouseId && el.fk_store === store.id_store).length) {
                return
            }

            payload.push({
                fk_stock: targetWarehouseId,
                fk_store: store.id_store
            })
        })

        if (payload.length) {
            return this.createEntities('stock-stores', JSON.stringify({
                data: payload
            }))
        }
    }
}