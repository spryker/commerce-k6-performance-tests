export default class EntityConfig {
    constructor(jsonConfig) {
        this.entities = jsonConfig
        this.entityMap = new Map()
        this.initMap()
    }

    initMap() {
        this.entities.map((entity) => {
            if (!entity.isActive) {
                return
            }

            if (!this.entityMap.has(entity.tableAlias)) {
                let config = {
                    alias: entity.tableAlias,
                    includes: entity.childRelations ? entity.childRelations.map((relation) => relation.name) : [],
                    fields: entity.definition.fields.map((field) => {
                        return {
                            field: field.fieldVisibleName,
                            type: field.type,
                            isCreatable: field.isCreatable,
                            isEditable: field.isEditable,
                        }
                    }),
                    relations: entity.childRelations ? entity.childRelations.map((relation) => {
                        return {
                            alias: relation.childDynamicEntityConfiguration.tableAlias,
                            isEditable: relation.isEditable,
                        }
                    }) : [],
                }
                this.entityMap.set(entity.tableAlias, config)
            }
        })
    }

    getPostPayload(entityAlias) {
        let payload = this.entityMap.get(entityAlias).fields.filter((field) => field.isCreatable).map((field) => {
            return 'KEY: \'\''.replace('KEY', field.field)
        })

        return '{KEY_VALUE}'.replace('KEY_VALUE', payload.join(','))
    }

    getEntityKeys() {
        return [...this.entityMap.keys()]
    }

    getEntitiesWithIncludes() {
        return [...this.entityMap.values()].filter((entity) => entity.includes.length).map((entity) => entity.alias)
    }

    getIncludesByEntityAlias(entityAlias) {
        if (!this.entityMap.has(entityAlias)) {
            return
        }
        return this.entityMap.get(entityAlias).includes
    }
}