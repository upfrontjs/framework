import type { MockResponseInit } from 'jest-fetch-mock';
import { isObject } from '../src/Support/function';

export const buildResponse = (response?: string|Record<string, any>): MockResponseInit => {
    let responseObject: MockResponseInit = {
        status: 200,
        body: JSON.stringify({ data: 'value' })
    };

    if (response && typeof response === 'string') {
        responseObject.body = response;
    }

    if (isObject(response)) {
        if (!response.body) {
            response.body = JSON.stringify(response);
        } else {
            response.body = JSON.stringify(response.body);
        }

        responseObject = Object.assign(responseObject, response);
    }

    return responseObject;
};

export const getFetchCalls = (): { url: string; method: 'get'|'post'|'delete'|'patch'|'put'; headers: Headers}[] => {
    // @ts-expect-error
    const calls = fetch.mock.calls;

    return calls.map((array: [string, { method: 'get'|'post'|'delete'|'patch'|'put'; headers: Headers }]) => {
        return Object.assign(array[1], { url: array[0] });
    });
};

export const getLastFetchCall = (): { url: string; method: 'get'|'post'|'delete'|'patch'|'put'; headers: Headers} => {
    const calls = getFetchCalls();

    // @ts-expect-error
    return calls[calls.length - 1];
};
