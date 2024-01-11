import {check} from "k6";

export class AssertionsHelper {
    assertResponseStatus(response, expectedStatus, requestName = null) {
        const assertionName = requestName
            ? `Verify that ${requestName} response status is ${expectedStatus}.`
            : `Verify response status is ${expectedStatus}.`;

        return check(response, {
            [assertionName]: (r) => r. status && r.status === expectedStatus,
        })
    }

    assertResponseContainsText(response, expectedText) {
        const assertionName = `Verify that response body contains text: "${expectedText}".`;

        return check(response, {
            [assertionName]: (r) => r.body && r.body.includes(expectedText),
        })
    }

    assertSingleResourceResponseBodyStructure(responseJson, requestName = null) {
        const dataAssertionName = requestName
            ? `Verify ${requestName} response body has 'data' defined.`
            : `Verify response body has 'data' defined.`;
        const dataAttributesAssertionMessage = requestName
            ? `Verify ${requestName} response body has 'data.attributes' defined.`
            : `Verify response body has 'data.attributes' defined.`;

        return check(responseJson, {
            [dataAssertionName]: (responseJson) => responseJson.data !== undefined,
            [dataAttributesAssertionMessage]: (responseJson) => responseJson.data.attributes !== undefined
        })
    }

    assertResourceCollectionResponseBodyStructure(responseJson, requestName = null) {
        const assertionName = requestName
            ? `Verify ${requestName} response body has 'data' defined.`
            : `Verify response body has 'data' defined.`;

        return !check(responseJson, {
            [assertionName]: (responseJson) => responseJson.data !== undefined,
        })
    }

    assertPageState(page, assertionName, assertion) {
        return check(page, {
            [assertionName]: (page) => assertion(page),
        });
    }

    assertRequestDurationIsLowerOrEqualTo(response, max) {
        const duration = response.timings.duration;
        const assertionName = `Response duration ${duration} is lower or equal to ${max}ms`;

        return check(response, {
            [assertionName]: () => duration <= max
        });
    }
}
