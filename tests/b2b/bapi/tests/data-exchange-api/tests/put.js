import { getExecutionConfiguration, getTemplateFolder, loadDefaultOptions } from '../../../../../../lib/utils.js';
import { ApiPutPayloadScenario } from '../scenarios/api-put-payload-scenario.js';

export const options = loadDefaultOptions();

let executionConfig = getExecutionConfiguration(
  __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE, 
  __ENV.DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE,
  __ENV.DATA_EXCHANGE_THREADS, 
  __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT
)

let productTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/product.json`)
let productConcreteTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/concrete.json`)
let productLabelTemplate = open(`../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/productLabel.json`)

options.scenarios = {
  ProductPutVUS: {
    exec: 'productPutScenario',
    executor: 'shared-iterations',
    tags: {
      testId: 'DX-PUT',
      testGroup: 'DataExchange',
    },
    iterations: executionConfig.amountOfIteration,
    vus: executionConfig.threads,
    maxDuration: '1200m'
  },
};

const productPutCreateScenario = new ApiPutPayloadScenario('DEX', executionConfig.chunkSize, executionConfig.concreteMaxAmount);

export function productPutScenario() {
  productPutCreateScenario.execute(productTemplate, productConcreteTemplate, productLabelTemplate);
}