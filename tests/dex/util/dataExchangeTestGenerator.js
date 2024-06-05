import EntityConfig from '../../../helpers/dynamicEntity/entityConfig.js';
import fs from 'fs';
import beautify_js from 'js-beautify';

export default class DataExchangeTestGenerator {
    constructor() {
        console.log(process.cwd())
        this.entitiesConfiguration = new EntityConfig(JSON.parse(fs.readFileSync(process.cwd() + '/tests/dex/tests/data/dex.json')))
    }

    generate(entityAlias = null) {
        if (!fs.existsSync(this.getOutputFolder())) {
            fs.mkdirSync(this.getOutputFolder(), {recursive: true})
        }

        let entities = this.entitiesConfiguration.getEntityKeysForTestsGeneration()
        if (this.entitiesConfiguration.getTableNameByAlias(entityAlias)) {
            entities = [this.entitiesConfiguration.getTableNameByAlias(entityAlias)]
        }

        for (const entityKey of entities) {
            if (fs.existsSync(this.getOutputFileName(entityKey))) {
                console.warn(`${entityKey} generation is skipped because file already exists.(${this.getOutputFileName(entityKey)})`)
                continue
            }
            this.save(this.addMetricName(this.addCreationLogic(this.readTemplate(), entityKey), entityKey), this.getOutputFileName(entityKey))
        }
    }

    toCamelCase(str) {
        try {
            return str
                .split(/\W+|_+| +/)
                .map((word, index) => {
                    if (index === 0) {
                        return word.toLowerCase();
                    }

                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join('');
        } catch (e) {
            console.log('toCamelCase', str)
        }
    }

    getOutputFileName(entityKey) {
        return [this.getOutputFolder(), `${this.toCamelCase(entityKey)}.js`].join('/')
    }

    getOutputFolder() {
        return [process.cwd(), 'tests/dex/tests/post'].join('/')
    }

    formatContent(data) {
        return beautify_js(data, { indent_size: 4 }).replace('IMPORTS', `import {loadDefaultOptions, loadEnvironmentConfig, uuid} from '../../../../lib/utils.js';
import Handler from '../../../../helpers/dynamicEntity/handler.js';
import {Http} from '../../../../lib/http.js';
import {UrlHelper} from '../../../../helpers/url-helper.js';
import {BapiHelper} from '../../../../helpers/bapi-helper.js';
import AdminHelper from '../../../../helpers/admin-helper.js';
import {AssertionsHelper} from '../../../../helpers/assertions-helper.js';
import {Metrics} from '../../../../helpers/browser/metrics.js';
        `);
    }

    save(content, outputFile) {
        if (!content) {
            return
        }
        fs.writeFileSync(outputFile, this.formatContent(content))
    }

    readTemplate() {
        return fs.readFileSync(process.cwd() + '/tests/dex/util/template/post.tpl').toString()
    }

    addMetricName(content, alias) {
        return content.replaceAll('TABLE_ALIAS', this.entitiesConfiguration.getAliasByTableName(alias))
    }

    addCreationLogic(content, alias) {
        let payload = JSON.stringify(this.entitiesConfiguration.reset().getPostPayload(alias))
        if (!payload.length) {
            return null
        }

        let logic = `let payload = new Array(1).fill(undefined).map(() => {
        return PAYLOAD
    })

    let response = requestHandler.createEntities('TABLE_ALIAS', JSON.stringify({
        data: payload
    }))

    if (response.status !== 201) {
        console.error(response.body)
    }
    metrics.add('TABLE_ALIAS-create', requestHandler.getLastResponse(), 201)
`
        return content.replaceAll('CREATE_LOGIC', logic).replace('PAYLOAD', payload)
    }
}