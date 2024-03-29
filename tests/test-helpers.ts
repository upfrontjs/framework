import type { MockResponseInit } from 'jest-fetch-mock';
import { cloneDeep } from 'lodash';
import { isObjectLiteral } from '../src/Support/function';
import Collection from '../src/Support/Collection';
import type User from './mock/Models/User';
import fetchMock from 'jest-fetch-mock';

export const buildResponse = (response?: any[] | Record<string, any> | string): MockResponseInit => {
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
        } catch (e: unknown) {}

        responseObject.body = JSON.stringify(value);
    } else if (Array.isArray(response)) {
        responseObject.body = JSON.stringify(response);
    } else if (Collection.isCollection(response)) {
        responseObject.body = JSON.stringify(response.toArray());
    } else if (isObjectLiteral(response)) {
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
    fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawAttributes())));
};

interface RequestDescriptor {
    url: string;
    method: 'delete' | 'get' | 'patch' | 'post' | 'put';
    headers: Headers;
    body?: unknown;
}

/**
 * Arrange information into an array of objects.
 */
export const getRequests = (): RequestDescriptor[] => {
    // @ts-expect-error
    const calls = fetch.mock.calls;

    return calls.map((array: [string, Partial<RequestDescriptor>]) => {
        return Object.assign(array[1], { url: array[0] });
    });
};

export const getLastRequest = (): RequestDescriptor | undefined => {
    const calls = getRequests();

    if (!calls.length) return;

    const lastCall = calls[calls.length - 1];

    if (lastCall && 'body' in lastCall && typeof lastCall.body === 'string') {
        try {
            lastCall.body = JSON.parse(lastCall.body);
            // eslint-disable-next-line no-empty
        } catch (e: unknown) {}
    }

    return lastCall;
};

export const types = [
    1,
    true,
    'val',
    [],
    {},
    (): void => {},
    Symbol,
    null,
    undefined,
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class C {},
    String,
    Object,
    BigInt,
    Function,
    Boolean,
    Number,
    Array,
    Map,
    Set,
    WeakSet,
    Date
];
