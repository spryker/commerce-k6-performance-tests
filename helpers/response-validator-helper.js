import {fail, check} from "k6";

export class ResponseValidatorHelper {
    validateResponseStatus(response, expectedStatus, requestName = null) {
        const validateMessage = requestName
            ? `Verify that ${requestName} response status is ${expectedStatus}.`
            : `Verify response status is ${expectedStatus}.`;
        const failMessage = requestName
            ? `${requestName} response status is not ${expectedStatus} but ${response.status}.`
            : `Response status is not ${expectedStatus} but ${response.status}.`;

        if (
            !check(response, {
                [validateMessage]: (r) => r.status === expectedStatus,
        })) {
            fail(failMessage);
        }
    }

    validateSingleResourceResponseJson(responseJson, requestName = null) {
        const validateDataMessage = requestName
            ? `Verify ${requestName} response body has 'data' defined.`
            : `Verify response body has 'data' defined.`;
        const validateDataAttributesMessage = requestName
            ? `Verify ${requestName} response body has 'data.attributes' defined.`
            : `Verify response body has 'data.attributes' defined.`;
        const failMessage = requestName
            ? `${requestName} response body does not contain valid JSON.`
            : `Response body does not contain valid JSON.`;

        if (
            !check(responseJson, {
                [validateDataMessage]: (responseJson) => responseJson.data !== undefined,
                [validateDataAttributesMessage]: (responseJson) => responseJson.data.attributes !== undefined
            })
        ) {
            fail(failMessage);
        }
    }

    validateResourceCollectionResponseJson(responseJson, requestName = null) {
        const validateDataMessage = requestName
            ? `Verify ${requestName} response body has 'data' defined.`
            : `Verify response body has 'data' defined.`;
        const failMessage = requestName
            ? `${requestName} response body does not contain valid JSON.`
            : `Response body does not contain valid JSON.`;

        if (
            !check(responseJson, {
                [validateDataMessage]: (responseJson) => responseJson.data !== undefined,
            })
        ) {
            fail(failMessage);
        }
    }

    validateResponseContainsText(response, expectedText, pageName = null) {
        const validationMessage = pageName
            ? `${pageName} response does not contain "${expectedText}" text.`
            : `Response does not contain "${expectedText}" text.`;
        const failMessage = pageName
            ? `${pageName} response does not contain "${expectedText}" text.`
            : `Response does not contain "${expectedText}" text.`;

        if (
            !check(response, {
                [validationMessage]: (r) => r.body.includes(expectedText),
            })
        ) {
            fail(failMessage);
        }
    }
}
