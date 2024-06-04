import EntityConfig from '../../../helpers/dynamicEntity/entityConfig.js';
import fs from 'fs';

export default class DataExchangeTestGenerator {
    constructor() {
        console.log(process.cwd())
        this.entitiesConfiguration = new EntityConfig(JSON.parse(fs.readFileSync(process.cwd() + '/tests/dex/tests/data/dex.json')))
    }

    generate() {
        for (const entityKey of this.entitiesConfiguration.getEntityKeys()) {
            if (!fs.existsSync(this.getOutputFolder(entityKey))) {
                fs.mkdirSync(this.getOutputFolder(entityKey), {recursive: true})
            }
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
        return [this.getOutputFolder(entityKey), 'post.js'].join('/')
    }

    getOutputFolder(entityKey) {
        return [process.cwd(), 'tests/dex/tests', this.toCamelCase(entityKey)].join('/')
    }

    save(content, outputFile) {
        fs.writeFileSync(outputFile, content)
    }

    readTemplate() {
        return fs.readFileSync(process.cwd() + '/tests/dex/util/template/post.tpl').toString()
    }

    addMetricName(content, alias) {
        return content.replaceAll('TABLE_ALIAS', alias)
    }

    addCreationLogic(content, alias) {
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

        return content.replaceAll('CREATE_LOGIC', logic).replace('PAYLOAD', this.entitiesConfiguration.getPostPayload(alias))
    }
}