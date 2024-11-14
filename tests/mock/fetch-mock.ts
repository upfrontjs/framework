import Collection from '../../src/Support/Collection';
import type { Method } from '../../src';
import { isObjectLiteral } from '../../src';
import { vi } from 'vitest';

/**
 * The mock of fetch.
 */
const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue('Implementation not set.');

/**
 * The values permitted in the response body for serialisation.
 */
type ResponseBody = any[] | Record<string, any> | string | undefined;

/**
 * Create a response from the given body and optionally response initialisation values.
 * @param response
 * @param responseInit
 */
const buildResponse = (
    response?: ResponseBody,
    responseInit?: ResponseInit
): Response => {
    function getBody(val?: any): string {
        if (typeof val === 'string') {
            return val;
        } else if (Array.isArray(val)) {
            return JSON.stringify(val);
        } else if (Collection.isCollection(val)) {
            return JSON.stringify(val.toArray());
        } else if (val?.body) {
            return getBody(val.body);
        } else if (isObjectLiteral(val)) {
            return JSON.stringify(val);
        }

        if (arguments.length === 1 && val === undefined) {
            return JSON.stringify(undefined);
        }

        return JSON.stringify({ data: 'value' });
    }

    return new Response(getBody(response), responseInit);
};

/**
 * Methods controlling the fetch mock.
 */
const fetchMock = {
    resetMocks: (): typeof spy => {
        spy.mockReset();
        return spy.mockRejectedValue('Implementation not set.');
    },
    mockResponseOnce: (body: ResponseBody, init?: ResponseInit): typeof spy => {
        return spy.mockResolvedValueOnce(buildResponse(body, init));
    },
    mockRejectOnce: (val: Error | string): typeof spy => spy.mockRejectedValueOnce(val)
};

/**
 * The shape of the request to inspect.
 */
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
    return spy.mock.calls.map((array: [string, Omit<RequestDescriptor, 'url'>]) => {
        return Object.assign(array[1], { url: array[0] });
    });
};

/**
 * Get the last call from the mock.
 */
export const getLastRequest = (): RequestDescriptor | undefined => {
    const calls = getRequests();

    if (!calls.length) {
        return undefined;
    }

    const lastCall = calls[calls.length - 1];

    if (lastCall && 'body' in lastCall && typeof lastCall.body === 'string') {
        try {
            lastCall.body = JSON.parse(lastCall.body);
            // eslint-disable-next-line no-empty
        } catch (e: unknown) {}
    }

    return lastCall;
};

export default fetchMock;
