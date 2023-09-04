import {ChatGPTAPI} from 'chatgpt'
import * as fs from 'fs'

async function example() {
    // URL=/en/login TEST_ID=S10 TEST_GROUP=Login PRODUCT=b2b npx tsx chat-gpt/executor.js

    // read a prompt template from file and fill with data
    let prompt = fs.readFileSync('./chat-gpt/templates/common.txt', 'utf8')
        .replace('{{url}}', process.env.URL)
        .replace('{{testId}}', process.env.TEST_ID)
        .replace('{{testGroup}}', process.env.TEST_GROUP)
        .replace('{{scenarioClassName}}', await generateTestScenarioPath())
        .replace('{{product}}', process.env.PRODUCT)

    const api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY
    })
    const res = await api.sendMessage(prompt)

    // regexp to find everything between ```js and ``` in the response
    const regexp = /```js\n([\s\S]+?)\n```/g
    const matchScenario = regexp.exec(res.text)

    let scenarioCode = matchScenario[1];

    const matchTest = regexp.exec(res.text)
    let testCode = matchTest[1];

    // write testCode to file
    let testFilePath = await generateTestPath()
    await fs.writeFileSync(testFilePath, testCode)

    // write scenarioCode to file
    let scenarioFilePath = await generateTestScenarioPath()
    await fs.writeFileSync(scenarioFilePath, scenarioCode)

    console.log(`Test code generated and saved to:     ${testFilePath}`)
    console.log(`Scenario code generated and saved to:     ${scenarioFilePath}`)
}

async function getApplicationByTestId(id) {
    // check if id starts with 'SAPI'
    if (id.startsWith('SAPI')) {
        return 'sapi'
    }

    return 'storefront'
}

async function generateTestPath() {
    const testId = process.env.TEST_ID
    const testGroup = process.env.TEST_GROUP

    const product = process.env.PRODUCT
    const application = await getApplicationByTestId(process.env.TEST_ID)

    return `tests/${product}/${application}/tests/${testGroup.toLowerCase()}/${product.toUpperCase()}-${testId}-${testGroup.toLowerCase()}.js`
}

async function generateTestScenarioPath() {
    const testGroup = process.env.TEST_GROUP

    const application = await getApplicationByTestId(process.env.TEST_ID)

    return `tests/cross-product/${application}/scenarios/${testGroup.toLowerCase()}/shared-${testGroup.toLowerCase()}-test-scenario.js`
}

example()