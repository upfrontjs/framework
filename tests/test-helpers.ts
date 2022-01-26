import type { MockResponseInit } from 'jest-fetch-mock';
import { isObjectLiteral } from '../src/Support/function';
import Collection from '../src/Support/Collection';
import type User from './mock/Models/User';
import fetchMock from 'jest-fetch-mock';
import type { Method } from '../src';

export const buildResponse = (
    response?: any[] | Record<string, any> | string,
    responseInit?: MockResponseInit & { body?: any }
): MockResponseInit => {
    const responseObject: MockResponseInit = {
        status: 200,
        body: JSON.stringify({ data: 'value' })
    };

    if (typeof response === 'string') {
        responseObject.body = response;
    } else if (Array.isArray(response)) {
        responseObject.body = JSON.stringify(response);
    } else if (Collection.isCollection(response)) {
        responseObject.body = JSON.stringify(response.toArray());
    } else if (isObjectLiteral(response) && !response.body) {
        responseObject.body = JSON.stringify(response);
    }

    if (responseInit) {
        Object.assign(responseObject, responseInit);
        if (isObjectLiteral(responseObject.body)) {
            responseObject.body = JSON.stringify(responseObject.body);
        }
    }

    return responseObject;
};

export const mockUserModelResponse = (user: User): void => {
    fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawAttributes())));
};

interface RequestDescriptor {
    url: string;
    method: Uppercase<Method>;
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
    Number,
    true,
    Boolean,
    'val',
    String,
    [],
    Array,
    {},
    Object,
    (): void => {},
    Function,
    Symbol,
    Symbol(),
    null,
    undefined,
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class C {},
    BigInt,
    Map,
    new Map,
    Set,
    new Set,
    WeakSet,
    new WeakSet,
    Date,
    new Date
];
