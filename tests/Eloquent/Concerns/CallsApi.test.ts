import CallsApi from '../../../src/Eloquent/Concerns/CallsApi';
import LogicException from '../../../src/Exceptions/LogicException';
// import type { MockResponseInit } from 'jest-fetch-mock';
import fetchMock from 'jest-fetch-mock';
import data from '../../mock/Models/data';

class Caller extends CallsApi {
    public get endpoint(): string {
        return 'endpoint';
    }
}

let caller: Caller;

// @ts-ignore
let sampleResponse: MockResponseInit;

// @ts-ignore
const resetResponse = (body?: string|Record<string, any>): void => {
    const response = {
        status: 200,
        body: JSON.stringify(data.UserOne)
    };

    if (body && typeof body === 'string') {
        response.body = body;
        return;
    }

    if (body && typeof body === 'object') {
        response.body = JSON.stringify(Object.assign({}, data.UserOne, body));
    }

    sampleResponse = response;
};

// jest.spyOn(window, 'fetch').mockImplementation().mockImplementation(async () => {
//     const response = new Response('hi');
//     return Promise.resolve(response);
// });
// jest.spyOn(global, 'fetch').mockImplementation().mockImplementation(async () => {
//     const response = new Response('hi');
//     return Promise.resolve(response);
// });

describe('callsApi', () => {
    beforeEach(() => {
        caller = new Caller();
        fetchMock.resetMocks();
        // resetResponse();
    });

    describe('constructor()', () => {
        it('resets the mutated endpoint to the set endpoint', () => {
            expect(caller.getEndpoint()).toBe(caller.endpoint);
        });
    });

    describe('call()', () => {
        it('throws error if no endpoint is defined',  async () => {
            caller.setEndpoint('');

            // awkward syntax comes from https://github.com/facebook/jest/issues/1700
            // @ts-expect-error
            await expect(caller.call('get')).rejects.toStrictEqual(
                new LogicException(
                    'Endpoint has not been defined for this \'get\' method on ' + caller.constructor.name
                )
            );
        });

        it('returns a promise with the response',  async () => {
            //// @ts-expect-error
            fetchMock.mockResponseOnce(JSON.stringify({ hi: 1 }));
            // @ts-expect-error
            const data = await caller.call('get');

            expect(data).toStrictEqual({ hi: 1 });
        });
    });
});
