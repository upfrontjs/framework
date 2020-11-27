import CallsApi from '../../../src/Calliope/Concerns/CallsApi';
import LogicException from '../../../src/Exceptions/LogicException';
import fetchMock from 'jest-fetch-mock';
import Config from '../../../src/Support/Config';
import API from '../../../src/Services/API';
import ApiResponseHandler from '../../../src/Services/ApiResponseHandler';
import { buildResponse, getLastFetchCall } from '../../test-helpers';
import User from '../../mock/Models/User';

class Caller extends CallsApi {
    public get endpoint(): string {
        return 'endpoint';
    }

    users(): User {
        return this.hasMany(User);
    }
}

let caller: Caller;
const config = new Config();

describe('callsApi', () => {
    beforeEach(() => {
        caller = new Caller();
        fetchMock.resetMocks();
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
                    'Endpoint is not defined when calling \'get\' method on \'' + caller.constructor.name + '\'.'
                )
            );
        });

        it('returns a promise with the response',  async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));
            // @ts-expect-error
            const responseData = await caller.call('get');

            expect(responseData).toStrictEqual(User.factory().raw());
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

            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse()));
            // @ts-expect-error
            await caller.call('get');
            expect(getLastFetchCall().headers.has('custom')).toBe(true);
            expect(getLastFetchCall().headers.get('custom')).toBe('header');
        });

        it('gets the HandlesApiResponse from the config if set',  async () => {
            const mockFn = jest.fn();
            const handler = new class customApiResponseHandlerImplementation extends ApiResponseHandler {
                handleFinally() {
                    mockFn();
                }
            };

            new Config({ ApiResponseHandler: handler });

            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse()));
            // @ts-expect-error
            await caller.call('get');
            expect(mockFn).toHaveBeenCalled();
        });
    });

    describe('newInstanceFromResponseData()', () => {
        it('throws error if unexpected data given', () => {
            //@ts-expect-error
            expect(() => caller.newInstanceFromResponseData(null)).toThrow(new TypeError(
                'Unexpected response type. Ensure that the endpoint returns model data only.'
            ));
        });

        it('can construct a single instance of a model', () => {
            const userData = User.factory().raw();
            //@ts-expect-error
            expect(caller.newInstanceFromResponseData(userData)).toStrictEqual();
        });
    });
});
