import DataExchangeTestGenerator from './dataExchangeTestGenerator.js';
import yargs from 'yargs/yargs';

let handler = new DataExchangeTestGenerator()
let options = ['all', ...handler.entitiesConfiguration.entityAliasMap.keys()]

const argv = yargs(process.argv.slice(2)).options({
    e: { type: 'string', describe: 'Entity for test generation', demandOption: false, choices: options},
}).parse();

let entity = argv.e
if (argv.e === undefined) {
    entity = 'all'
}

console.log(entity)
handler.generate(entity)
