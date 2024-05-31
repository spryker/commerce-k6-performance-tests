import Handler from '../handler.js';

export default class CategoryHandler extends Handler {

    getTableAlias() {
        return 'categories'
    }

    setup(storeConfig, localesIds = []) {
        let entityConfigs = [
            {
                read_entity: {
                    table: 'categories',
                    fk: 'id_category'
                },
                write_entity: {
                    table: 'category-stores',
                    fk: 'fk_category'
                },
            }
        ]
        let results = this.assignExistingEntitiesToStores(entityConfigs, storeConfig)
        this.validateResponses(results)

        let configs = [
            {
                read_entity: {
                    table: 'categories',
                    fk: 'id_category'
                },
                write_entity: {
                    table: 'category-attributes',
                    fk: 'fk_category',
                    copy: {
                        id_category: 'fk_category',
                        category_key: 'name'
                    }
                },
            }
        ]
        results = this.assignAttributesToLocales(configs, localesIds)
        this.validateResponses(results)

    }
}