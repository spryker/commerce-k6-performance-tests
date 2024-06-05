export default class EntityConfig {
    constructor(jsonConfig) {
        this.entities = jsonConfig
        this.entityMap = new Map()
        this.entityAliasMap = new Map()
        this.childMap = new Map()
        this.generated = new Map()
        this.initMap()
    }

    initMap() {
        this.entities.map((entity) => {
            if (!entity.isActive) {
                return
            }

            if (!this.entityMap.has(entity.tableName)) {
                let config = {
                    alias: entity.tableAlias,
                    table: entity.tableName,
                    includes: entity.childRelations ? entity.childRelations.map((relation) => {
                        return {
                            relationName: relation.name,
                            tableAlias: relation.childDynamicEntityConfiguration.tableAlias,
                            isEditable: relation.isEditable
                        }
                    }) : [],
                    fields: entity.definition.fields.map((field) => {
                        return {
                            field: field.fieldVisibleName,
                            type: field.type,
                            isCreatable: field.isCreatable,
                            isEditable: field.isEditable,
                        }
                    }),
                    relations: entity.childRelations ? entity.childRelations.map((relation) => {
                        this.childMap.set(relation.childDynamicEntityConfiguration.tableAlias, 1)
                        return {
                            alias: relation.childDynamicEntityConfiguration.tableAlias,
                            isEditable: relation.isEditable,
                        }
                    }) : [],
                }
                this.entityMap.set(entity.tableName, config)
                this.entityAliasMap.set(entity.tableAlias, config)
            }
        })
    }

    reset() {
        this.generated.clear()

        return this
    }

    getPostPayload(tableName) {
        let payload = {}
        if (this.generated.has(tableName)) {
            return null
        }
        this.entityMap.get(tableName).fields.filter((field) => field.isCreatable).map((field) => {
            payload[field.field] = `${field.type}`
        })
        this.generated.set(tableName, 1)

        if (!Object.keys(payload).length) {
            return null
        }

        for (const aliasToInclude of this.getIncludesByEntityAlias(tableName)) {
            if (!aliasToInclude.isEditable) {
                continue
            }
            let res = this.getPostPayload(this.entityAliasMap.get(aliasToInclude.tableAlias).table)
            if (res) {
                payload[aliasToInclude.relationName] = [res]
            }
        }

        return payload
    }

    isCandidateForSimplePayload(alias) {
        return !this.isRelationalTable(alias) && !this.getIncludeAliasesByEntityAlias(alias).length
    }

    isCandidateForComplexPayload(alias) {
        return !this.isRelationalTable(alias) && this.getIncludeAliasesByEntityAlias(alias).length
    }

    isRelationalTable(alias) {
        return this.childMap.has(alias)
    }

    getAliasByTableName(tableName) {
        return this.entityMap.get(tableName).alias
    }

    getTableNameByAlias(alias) {
        return this.entityAliasMap.get(alias).table
    }

    getEntityKeys() {
        return [...this.entityMap.keys()]
    }

    getEntityKeysForTestsGeneration() {
        return [...this.entityMap.values()].filter((entity) => {
            // return this.isCandidateForComplexPayload(entity.alias) || this.isCandidateForSimplePayload(entity.alias)
            // return !this.isRelationalTable(entity.alias)
            return this.getIncludeAliasesByEntityAlias(entity.alias).length
        }).map((entity) => entity.table)
    }

    getEntitiesWithIncludes() {
        return [...this.entityMap.values()].filter((entity) => entity.includes.length).map((entity) => entity.table)
    }

    getIncludeAliasesByEntityAlias(entityAlias) {
        if (!this.entityAliasMap.has(entityAlias)) {
            return []
        }
        return this.entityAliasMap.get(entityAlias).includes.map((includeInfo) => includeInfo.relationName)
    }

    getIncludesByEntityAlias(entityAlias) {
        if (!this.entityMap.has(entityAlias)) {
            return []
        }
        return this.entityMap.get(entityAlias).includes
    }
}