import CallsApi from '../../../src/Eloquent/Concerns/CallsApi';
import LogicException from '../../../src/Exceptions/LogicException';
import type { MockResponseInit } from 'jest-fetch-mock';
import fetchMock from 'jest-fetch-mock';
import data from '../../mock/Models/data';
import Config from '../../../src/Support/Config';
import API from '../../../src/Services/API';

class Caller extends CallsApi {
    public get endpoint(): string {
        return 'endpoint';
    }
}

let caller: Caller;
let sampleResponse: MockResponseInit;
const config = new Config();

const resetResponse = (response?: string|Record<string, any>): void => {
    let responseObject = {
        status: 200,
        body: JSON.stringify(data.UserOne)
    };

    if (response && typeof response === 'string') {
        responseObject.body = response;
        return;
    }

    if (response && typeof response === 'object') {
        responseObject = Object.assign(responseObject, response);
    }

    sampleResponse = responseObject;
};

const getLastFetchCall = (): { url: string; method: 'get'|'post'|'delete'|'patch'|'put'; headers: Headers} => {
    // @ts-expect-error
    const calls = fetch.mock.calls;

    const lastCall = calls[calls.length - 1];
    lastCall[1].url = lastCall[0];

    return lastCall[1];
};

describe('callsApi', () => {
    beforeEach(() => {
        caller = new Caller();
        fetchMock.resetMocks();
        resetResponse();
        config.reset();
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
                    'Endpoint has not been defined when calling \'get\' method on ' + caller.constructor.name
                )
            );
        });

        it('returns a promise with the response',  async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(sampleResponse));
            // @ts-expect-error
            const responseData = await caller.call('get');

            expect(responseData).toStrictEqual(data.UserOne);
        });

        it('gets the ApiCaller from the config if set',  async () => {
            const api = new class customAPICallerImplementation extends API {
                initRequest(): Partial<RequestInit> {
                    const headers = new Headers();
                    headers.set('custom', 'header');

                    return { headers };
                }
            };

            new Config({ API: api });

            fetchMock.mockResponseOnce(async () => Promise.resolve(sampleResponse));
            // @ts-expect-error
            await caller.call('get');
            expect(getLastFetchCall().headers.has('custom')).toBe(true);
            expect(getLastFetchCall().headers.get('custom')).toBe('header');
        });
    });
});
