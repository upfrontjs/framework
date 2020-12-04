import LogicException from '../../../src/Exceptions/LogicException';
import fetchMock from 'jest-fetch-mock';
import Config from '../../../src/Support/Config';
import API from '../../../src/Services/API';
import ApiResponseHandler from '../../../src/Services/ApiResponseHandler';
import { buildResponse, getLastFetchCall } from '../../test-helpers';
import User from '../../mock/Models/User';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

let caller: User;

const config = new Config();

const mockUserModelResponse = (user: User): void => {
    fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawOriginal())));
};

describe('callsApi', () => {
    beforeEach(() => {
        caller = new User();
        caller.usesSoftDeletes = () => false;
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
            expect(getLastFetchCall()?.headers.has('custom')).toBe(true);
            expect(getLastFetchCall()?.headers.get('custom')).toBe('header');
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

        it('internally counts the number of ongoing requests', async () => {
            jest.useFakeTimers();
            fetchMock.mockResponse(async () => new Promise( resolve =>
                setTimeout(
                    () => resolve(buildResponse((User.factory().create() as User).getRawOriginal())),
                    100
                )
            ));

            // @ts-expect-error
            const promise1 = caller.call('get');
            // @ts-expect-error
            const promise2 = caller.call('get');

            // @ts-expect-error
            expect(caller.requestCount).toBe(2);

            jest.runAllTimers();

            await Promise.all([promise1, promise2]);

            // @ts-expect-error
            expect(caller.requestCount).toBe(0);

            jest.useRealTimers();
        });

        it('can determine whether there is an ongoing request or not', async () => {
            jest.useFakeTimers();
            fetchMock.mockResponseOnce(async () => new Promise( resolve =>
                setTimeout(
                    () => resolve(buildResponse((User.factory().create() as User).getRawOriginal())),
                    100
                )
            ));

            // @ts-expect-error
            const promise = caller.call('get');

            expect(caller.loading).toBe(true);

            jest.runAllTimers();

            await promise;

            expect(caller.loading).toBe(false);

            jest.useRealTimers();
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
            expect(caller.newInstanceFromResponseData([userData]) as ModelCollection<User>)
                .toStrictEqual(new ModelCollection([new User(userData)]));
        });

        it('force fills the models from the response', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().raw() as Attributes;
            const expectedUser = new User(userData);

            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalFillableReturn =  User.prototype.getFillable;

            User.prototype.getFillable = () => [];

            //@ts-expect-error
            expect(caller.newInstanceFromResponseData(userData).getAttributes())
                .toStrictEqual(expectedUser.getAttributes());

            User.prototype.getFillable = originalFillableReturn;
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
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            // @ts-expect-error
            delete caller.endpoint;
            caller.resetEndpoint();

            expect(caller.getEndpoint()).toBe('users');
        });
    });

    describe('appendToEndpoint()', () => {
        it('can append a string to the endpoint', () => {
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            expect(caller.appendToEndpoint('/1').getEndpoint()).toBe(caller.endpoint + '/1');
        });
    });

    describe('get()', () => {
        it('sends a GET request', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            await caller.get();
            expect(getLastFetchCall()?.method).toBe('get');
        });

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

            expect(getLastFetchCall()?.url).toBe(
                String(config.get('baseEndPoint')) + '/'
                + caller.getEndpoint() + '?myParam=1'
            );
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.get();

            expect(getLastFetchCall()?.url).toBe(
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

    describe('post()', () => {
        it('can send a POST request', async () => {
            mockUserModelResponse(caller);
            await caller.post({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('post');
        });

        it('returns this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.post(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            // @ts-expect-error
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.post({ key: 'value' });

            // the returned model is the calling model
            // @ts-expect-error
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('resets the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.post({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('resets the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.post({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.post({ key: 'value' });

            expect(getLastFetchCall()?.body).toStrictEqual({
                key: 'value',
                wheres: [
                    {
                        boolean: 'and',
                        column: 'id',
                        operator: '=',
                        value: 43
                    }
                ]
            });
        });
    });

    describe('put()', () => {
        it('can send a PUT request', async () => {
            mockUserModelResponse(caller);
            await caller.put({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('put');
        });

        it('returns this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.put(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            // @ts-expect-error
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.put({ key: 'value' });

            // the returned model is the calling model
            // @ts-expect-error
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('resets the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.put({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('resets the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.put({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.put({ key: 'value' });

            expect(getLastFetchCall()?.body).toStrictEqual({
                key: 'value',
                wheres: [
                    {
                        boolean: 'and',
                        column: 'id',
                        operator: '=',
                        value: 43
                    }
                ]
            });
        });
    });

    describe('patch()', () => {
        it('can send a PATCH request', async () => {
            mockUserModelResponse(caller);
            await caller.patch({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('patch');
        });

        it('returns this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.patch(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            // @ts-expect-error
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.patch({ key: 'value' });

            // the returned model is the calling model
            // @ts-expect-error
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('resets the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.patch({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('resets the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.patch({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.patch({ key: 'value' });

            expect(getLastFetchCall()?.body).toStrictEqual({
                key: 'value',
                wheres: [
                    {
                        boolean: 'and',
                        column: 'id',
                        operator: '=',
                        value: 43
                    }
                ]
            });
        });
    });

    describe('delete()', () => {
        it('can send a DELETE request', async () => {
            mockUserModelResponse(caller);
            await caller.delete();

            expect(getLastFetchCall()?.method).toBe('delete');
        });

        it('can send information in the request body', async () => {
            mockUserModelResponse(caller);
            await caller.delete({ key: 'value' });

            expect(getLastFetchCall()?.body).toStrictEqual({ key: 'value' });
        });

        it('returns this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.delete(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            // @ts-expect-error
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.delete();

            // the returned model is the calling model
            // @ts-expect-error
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('resets the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.delete();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('resets the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.delete();

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('can send query parameters in the request', async () => {
            caller.whereKey(43);

            mockUserModelResponse(User.factory().create() as User);
            await caller.delete();

            expect(getLastFetchCall()?.body).toStrictEqual({
                wheres: [
                    {
                        boolean: 'and',
                        column: 'id',
                        operator: '=',
                        value: 43
                    }
                ]
            });
        });
    });
});
