import type { MockResponseInit } from 'jest-fetch-mock';
import { cloneDeep } from 'lodash';
import { isObject } from '../src/Support/function';
import type User from './mock/Models/User';
import fetchMock from 'jest-fetch-mock';

export const buildResponse = (response?: string|Record<string, any>): MockResponseInit => {
    let responseObject: MockResponseInit = {
        status: 200,
        body: JSON.stringify({ data: 'value' })
    };

    response = cloneDeep(response);

    if (response && typeof response === 'string') {
        let value = response;

        try {
            value = JSON.parse(value);
            // eslint-disable-next-line no-empty
        } catch (e) {}

        responseObject.body = JSON.stringify(value);
    }

    if (isObject(response)) {
        if (!response.body) {
            responseObject.body = JSON.stringify(response);
        } else {
            response.body = JSON.stringify(response.body);
            responseObject = Object.assign(responseObject, response);
        }
    }

    return responseObject;
};

export const mockUserModelResponse = (user: User): void => {
    fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawOriginal())));
};

type FetchCall = {
    url: string;
    method: 'get'|'post'|'delete'|'patch'|'put';
    headers: Headers;
    body?: any;
};

/**
 * Arrange information into an object.
 */
export const getFetchCalls = (): FetchCall[] => {
    // @ts-expect-error
    const calls = fetch.mock.calls;

    return calls.map((array: [string, Partial<FetchCall>]) => {
        return Object.assign(array[1], { url: array[0] });
    });
};

export const getLastFetchCall = (): FetchCall|undefined => {
    const calls = getFetchCalls();

    if (!calls.length) {
        return;
    }

    const lastCall: NonNullable<any> = calls[calls.length - 1];

    if ('body' in lastCall && typeof lastCall.body === 'string') {
        try {
            lastCall.body = JSON.parse(lastCall.body);
        }
        // eslint-disable-next-line no-empty
        catch (e) {}
    }

    return lastCall;
};
