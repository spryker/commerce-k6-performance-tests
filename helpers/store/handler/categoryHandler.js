import Handler from "../handler.js";

export default class CategoryHandler extends Handler {

    getTableAlias() {
        return 'categories'
    }

    setup(storeConfig) {
        let config = [
            {
                entity: {
                    table: 'categories',
                    fk: 'id_category'
                },
                entity_store: {
                    table: 'category-stores',
                    fk: 'fk_category'
                },
            }
        ]
        for (const sourceConfig of config) {
            let data = this.getDataFromTable(sourceConfig.entity.table)
            let activeEntities = data.filter((el) => el.is_active)
            let entityStores =  this.getDataFromTable(sourceConfig.entity_store.table)

            let payload = []
            storeConfig.map((store) => {
                activeEntities.map((entity) => {
                    if (entityStores.filter((el) => el[sourceConfig.entity_store.fk] === entity[sourceConfig.entity.fk] && el.fk_store === store.id_store).length) {
                        return
                    }

                    payload.push({
                        fk_category: entity[sourceConfig.entity.fk],
                        fk_store: store.id_store
                    })
                })
            })

            if (payload.length) {
                return this.createEntities(sourceConfig.entity_store.table, JSON.stringify({
                    data: payload
                }))
            }
        }
    }
}