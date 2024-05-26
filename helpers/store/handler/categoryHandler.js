import Handler from "../handler.js";

export default class CategoryHandler extends Handler {

    getTableAlias() {
        return 'categories'
    }

    setup(storeConfig) {
        let entityConfigs = [
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
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)
        this.validateResponses(results)
    }
}