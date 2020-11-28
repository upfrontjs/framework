import type CallsApi from '../../../src/Calliope/Concerns/CallsApi';
import LogicException from '../../../src/Exceptions/LogicException';
import fetchMock from 'jest-fetch-mock';
import Config from '../../../src/Support/Config';
import API from '../../../src/Services/API';
import ApiResponseHandler from '../../../src/Services/ApiResponseHandler';
import { buildResponse, getLastFetchCall } from '../../test-helpers';
import User from '../../mock/Models/User';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

let caller: CallsApi;

const config = new Config();

const mockUserModelResponse = (user: User): void => {
    fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawOriginal())));
};

describe('callsApi', () => {
    beforeEach(() => {
        caller = new User();
        fetchMock.resetMocks();
        config.unset('ApiResponseHandler');
        config.unset('API');
    });

    describe('constructor()', () => {
        it('resets the mutated endpoint to the set endpoint', () => {
            expect(caller.getEndpoint()).toBe('users');
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
            expect(caller.newInstanceFromResponseData(userData)).toStrictEqual(new User(userData));
        });

        it('can construct a model collection on array argument', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().raw() as Attributes;
            //@ts-expect-error
            expect(caller.newInstanceFromResponseData([userData]))
                .toStrictEqual(new ModelCollection([new User(userData)]));
        });
    });

    describe('setEndpoint()', () => {
        it('can set the endpoint for the model', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
        });

        it('can returns model', () => {
            expect(caller.setEndpoint('endpoint').getEndpoint()).toBe('endpoint');
        });
    });

    describe('getEndpoint()', () => {
        it('can get the endpoint for the model', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
        });
    });

    describe('resetEndpoint()', () => {
        it('can reset the endpoint', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
            caller.resetEndpoint();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('can figure out an endpoint if endpoint is not defined on the model', () => {
            // @ts-expect-error
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            // @ts-expect-error
            delete caller.endpoint;
            caller.resetEndpoint();

            expect(caller.getEndpoint()).toBe('users');
        });
    });

    describe('appendToEndpoint()', () => {
        it('can append a string to the endpoint', () => {
            // @ts-expect-error
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            // @ts-expect-error
            expect(caller.appendToEndpoint('/1').getEndpoint()).toBe(caller.endpoint + '/1');
        });
    });

    describe('get()', () => {
        it('returns a promise with new model or model collection', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            const data = await caller.get();
            expect(data).toStrictEqual(user);
        });

        it('resets the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.get();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('resets the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.get();

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('can take parameters for the request', async () => {
            mockUserModelResponse(User.factory().create() as User);
            await caller.get({ myParam: 1 });

            expect(getLastFetchCall().url).toBe(
                String(config.get('baseEndPoint')) + '/'
                + caller.getEndpoint() + '?myParam=1'
            );
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.get();

            expect(getLastFetchCall().url).toBe(
                String(config.get('baseEndPoint')) + '/'
                + caller.getEndpoint()
                + '?wheres[][column]=id&wheres[][operator]=%3D&wheres[][value]=43&wheres[][boolean]=and'
            );
        });

        it('works statically', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            const data = await User.get();

            expect(data).toStrictEqual(user);
        });
    });
});
