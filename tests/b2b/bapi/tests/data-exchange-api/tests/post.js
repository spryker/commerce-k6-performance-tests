import { ApiPostPayloadScenario } from '../scenarios/api-post-payload-scenario.js';
import { getExecutionConfiguration, getTemplateFolder, loadDefaultOptions } from '../../../../../../lib/utils.js';

export const options = loadDefaultOptions();

let productTemplate = open(
  `../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/product.json`
);
let productConcreteTemplate = open(
  `../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/concrete.json`
);
let productLabelTemplate = open(
  `../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/productLabel.json`
);
let productImageTemplate = open(
  `../template/${getTemplateFolder(Boolean(Number(__ENV.DATA_EXCHANGE_TWO_LOCALES)))}/productImage.json`
);

let executionConfig = getExecutionConfiguration(
  __ENV.DATA_EXCHANGE_TARGET_CATALOG_SIZE,
  __ENV.DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE,
  __ENV.DATA_EXCHANGE_THREADS,
  __ENV.DATA_EXCHANGE_CONCRETE_MAX_AMOUNT
);

options.scenarios = {
  ProductCreatePostVUS: {
    exec: 'productPostScenario',
    executor: 'shared-iterations',
    tags: {
      testId: 'DX-POST',
      testGroup: 'DataExchange',
    },
    iterations: executionConfig.amountOfIteration,
    vus: executionConfig.threads,
    maxDuration: '1200m',
  },
};

const productCreateScenario = new ApiPostPayloadScenario(
  'DEX',
  executionConfig.chunkSize,
  executionConfig.concreteMaxAmount
);
export function productPostScenario() {
  productCreateScenario.execute(productTemplate, productConcreteTemplate, productImageTemplate, productLabelTemplate);
}
