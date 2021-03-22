import LogicException from '../../../src/Exceptions/LogicException';
import fetchMock from 'jest-fetch-mock';
import API from '../../../src/Services/API';
import ApiResponseHandler from '../../../src/Services/ApiResponseHandler';
import { buildResponse, getLastFetchCall, mockUserModelResponse } from '../../test-helpers';
import User from '../../mock/Models/User';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import { config } from '../../setupTests';
import type Collection from '../../../src/Support/Collection';
import type Model from '../../../src/Calliope/Model';
import { advanceTo } from 'jest-date-mock';
import { snake } from '../../../src';

let caller: User;

describe('CallsApi', () => {
    beforeEach(() => {
        caller = new User();
        caller.usesSoftDeletes = () => false;
        fetchMock.resetMocks();
        config.unset('ApiResponseHandler');
        config.unset('API');
    });

    describe('constructor()', () => {
        it('should reset the mutated endpoint to the set endpoint', () => {
            expect(caller.getEndpoint()).toBe('users');
        });
    });

    describe('.serverAttributeCasing', () => {
        it('should cast the outgoing attributes to the set serverAttributeCasing', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));
            // @ts-expect-error
            await caller.call('post', { someValue: 1 });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(getLastFetchCall()?.body).toStrictEqual({ some_value: 1 });
        });

        it('should recursively cast the keys to any depth', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));
            // @ts-expect-error
            await caller.call('post', {
                someValue: {
                    anotherValue: 1
                }
            });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(getLastFetchCall()?.body).toStrictEqual({ some_value: { another_value: 1 } });
        });

        it('should get the serverAttributeCasing from the extending model', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));

            class UserWithSnakeCase extends User {
                protected get serverAttributeCasing() {
                    return 'camel' as const;
                }
            }

            const user = new UserWithSnakeCase;

            // @ts-expect-error
            await user.call('post', {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                some_value: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    another_value: 1
                }
            });

            expect(getLastFetchCall()?.body).toStrictEqual({ someValue: { anotherValue: 1 } });
        });

        it('should not cast keys for form data', async () => {
            const formData = new FormData();
            formData.append('my_field', 'value');
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));

            // @ts-expect-error
            await caller.call('post', formData);

            expect((getLastFetchCall()?.body as FormData).has('my_field')).toBe(true);
            expect((getLastFetchCall()?.body as FormData).has('myField')).toBe(false);
        });
    });

    describe('call()', () => {
        it('should throw an error if no endpoint is defined',  async () => {
            caller.setEndpoint('');

            // awkward syntax comes from https://github.com/facebook/jest/issues/1700
            // @ts-expect-error
            await expect(caller.call('get')).rejects.toStrictEqual(
                new LogicException(
                    'Endpoint is not defined when calling \'get\' method on \'' + caller.constructor.name + '\'.'
                )
            );
        });

        it('should return a promise with the response',  async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().raw())));
            // @ts-expect-error
            const responseData = await caller.call('get');

            expect(responseData).toStrictEqual(User.factory().raw());
        });

        it('should get the ApiCaller from the Configuration if set',  async () => {
            const api = class CustomAPICallerImplementation extends API {
                public initRequest(): Partial<RequestInit> {
                    const headers = new Headers();
                    headers.set('custom', 'header');

                    return { headers };
                }
            };

            config.set('api', api);

            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse()));
            // @ts-expect-error
            await caller.call('get');
            expect(getLastFetchCall()?.headers.has('custom')).toBe(true);
            expect(getLastFetchCall()?.headers.get('custom')).toBe('header');
        });

        it('should get the HandlesApiResponse from the Configuration if set',  async () => {
            const mockFn = jest.fn();
            const apiResponseHandler = class CustomApiResponseHandlerImplementation extends ApiResponseHandler {
                public handleFinally() {
                    mockFn();
                }
            };

            config.set('apiResponseHandler', apiResponseHandler);

            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse()));
            // @ts-expect-error
            await caller.call('get');
            expect(mockFn).toHaveBeenCalled();
        });

        it('should internally count the number of ongoing requests', async () => {
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

        it('should determine whether there is an ongoing request or not', async () => {
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
        it('should throw an error if unexpected data given', () => {
            [null, undefined, [{}, 1]].forEach(invalidVal => {
                //@ts-expect-error
                expect(() => caller.newInstanceFromResponseData(invalidVal)).toThrow(new TypeError(
                    'Unexpected response type. Ensure that the endpoint returns model data only.'
                ));
            });
        });

        it('should construct a single instance of a model', () => {
            const userData = User.factory().raw();
            //@ts-expect-error
            expect(caller.newInstanceFromResponseData(userData)).toStrictEqual(new User(userData));
        });

        it('should construct a model collection on array argument', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().raw() as Attributes;
            //@ts-expect-error
            expect(caller.newInstanceFromResponseData([userData]) as ModelCollection<User>)
                .toStrictEqual(new ModelCollection([new User(userData)]));
        });

        it('should force fill the models from the response', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().raw() as Attributes;
            const expectedUser = new User(userData);

            // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method
            const originalFillableReturn =  User.prototype.getFillable;

            User.prototype.getFillable = () => [];

            //@ts-expect-error
            const callerModel = caller.newInstanceFromResponseData(userData) as caller;

            expect(callerModel.getAttributes()).toStrictEqual(expectedUser.getAttributes());
            expect(callerModel.getRawOriginal()).toStrictEqual(expectedUser.getRawOriginal());

            User.prototype.getFillable = originalFillableReturn;
        });

        it('should set _lastSyncedAt or _last_synced_at getter on the model or model collection', () => {
            advanceTo(new Date);
            const userData = User.factory().raw() as Attributes;

            //@ts-expect-error
            const user = caller.newInstanceFromResponseData(userData) as User;
            // @ts-expect-error
            expect(user['_' + String(user.setStringCase('last_synced_at'))]).toStrictEqual(new Date);

            const usersData = User.factory().times(2).raw() as Collection<Attributes>;

            // @ts-expect-error
            const users = caller.newInstanceFromResponseData(usersData.toArray()) as ModelCollection<Model>;

            users.forEach(userModel => {
                // @ts-expect-error
                expect(userModel['_' + String(userModel.setStringCase('last_synced_at'))]).toStrictEqual(new Date);
            });
        });
    });

    describe('setLastSyncedAt()', () => {
        it('should set the attribute with the correct casing', () => {
            // @ts-expect-error
            caller.setLastSyncedAt();
            expect(caller._last_synced_at).toBeUndefined();
            expect(caller._lastSyncedAt).not.toBeUndefined();
            Object.defineProperty(caller, 'attributeCasing', { get: () => 'snake' });

            // @ts-expect-error
            caller.setLastSyncedAt();
            expect(caller._last_synced_at).not.toBeUndefined();
            // if you update the string casing on the fly, that's on you
            // and you might end up with _lastSyncedAt and _last_synced_at
        });

        it('should return itself ready for chaining', () => {
            // @ts-expect-error
            expect(caller.setLastSyncedAt()).toBeInstanceOf(User);
        });

        it('should use itself with new date as defaults or set to the given values', () => {
            // freeze time
            advanceTo(new Date);

            // @ts-expect-error
            caller.setLastSyncedAt();
            expect(caller._lastSyncedAt).toStrictEqual(new Date);

            const model = User.factory().create() as User;

            // @ts-expect-error
            caller.setLastSyncedAt('my value', model);

            expect(model._lastSyncedAt).toBe('my value');
        });
    });

    describe('setEndpoint()', () => {
        it('should set the endpoint for the model', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
        });

        it('should returns model', () => {
            expect(caller.setEndpoint('endpoint').getEndpoint()).toBe('endpoint');
        });
    });

    describe('getEndpoint()', () => {
        it('should get the endpoint for the model', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
        });
    });

    describe('resetEndpoint()', () => {
        it('should reset the endpoint', () => {
            caller.setEndpoint('endpoint');
            expect(caller.getEndpoint()).toBe('endpoint');
            caller.resetEndpoint();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should figure out an endpoint if endpoint is not defined on the model', () => {
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            // @ts-expect-error
            delete caller.endpoint;
            caller.resetEndpoint();

            expect(caller.getEndpoint()).toBe('users');
        });
    });

    describe('appendToEndpoint()', () => {
        it('should append a string to the endpoint', () => {
            expect(caller.getEndpoint()).toBe(caller.endpoint);
            expect(caller.appendToEndpoint('/1').getEndpoint()).toBe(caller.endpoint + '/1');
        });
    });

    describe('get()', () => {
        it('should send a GET request', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            await caller.get();
            expect(getLastFetchCall()?.method).toBe('get');
        });

        it('should return a promise with new model or model collection', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            const data = await caller.get();
            expect(data).toStrictEqual(user);
        });

        it('should reset the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.get();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.get();

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should take parameters for the request', async () => {
            mockUserModelResponse(User.factory().create() as User);
            await caller.get({ myParam: 1 });

            expect(getLastFetchCall()?.url)
                .toBe(`${config.get('baseEndPoint')!}/${caller.getEndpoint()}?${snake('myParam')}=1`);
        });

        it('should send query parameters in the request', async () => {
            mockUserModelResponse(User.factory().create() as User);
            await caller.whereKey(43).get();

            expect(getLastFetchCall()?.url).toBe(
                String(config.get('baseEndPoint')) + '/'
                + caller.getEndpoint()
                + '?wheres[][column]=id&wheres[][operator]=%3D&wheres[][value]=43&wheres[][boolean]=and'
            );
        });

        it('should works statically', async () => {
            const user = User.factory().create() as User;
            mockUserModelResponse(user);

            const data = await User.get();

            expect(data).toStrictEqual(user);
        });
    });

    describe('post()', () => {
        it('should send a POST request', async () => {
            mockUserModelResponse(caller);
            await caller.post({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('post');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.post(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.post({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should reset the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.post({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.post({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should send query parameters in the request', async () => {
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
        it('should send a PUT request', async () => {
            mockUserModelResponse(caller);
            await caller.put({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('put');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.put(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.put({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should reset the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.put({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.put({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should send query parameters in the request', async () => {
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
        it('should send a PATCH request', async () => {
            mockUserModelResponse(caller);
            await caller.patch({ key: 'value' });

            expect(getLastFetchCall()?.method).toBe('patch');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            const callerUser = User.factory().create() as User;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.patch(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.patch({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should reset the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.patch({ key: 'value' });
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.patch({ key: 'value' });

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should send query parameters in the request', async () => {
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

    describe('update()', () => {
        it('should call the patch() method', async () => {
            mockUserModelResponse(caller);
            const spy = jest.spyOn(caller, 'patch');
            await caller.update({ key: 'value' });

            expect(spy).toHaveBeenCalledWith({ key: 'value' });
            spy.mockRestore();
        });

        it('should set the correct endpoint', async () => {
            mockUserModelResponse(caller);

            await caller.update({ key: 'value' });
            expect(getLastFetchCall()?.url).toContain(caller.getEndpoint() + '/' + String(caller.getKey()));
        });
    });

    describe('delete()', () => {
        it('should send a DELETE request', async () => {
            mockUserModelResponse(caller);
            await caller.delete();

            expect(getLastFetchCall()?.method).toBe('delete');
        });

        it('should send information in the request body', async () => {
            mockUserModelResponse(caller);
            await caller.delete({ key: 'value' });

            expect(getLastFetchCall()?.body).toStrictEqual({ key: 'value' });
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().create() as User;
            responseUser.usesSoftDeletes = () => false;
            const callerUser = User.factory().create() as User;
            callerUser.usesSoftDeletes = () => false;

            // if response returns model data
            mockUserModelResponse(responseUser);
            let returnModel = await callerUser.delete(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse('1')));
            returnModel = await callerUser.delete();

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should reset the endpoint', async () => {
            mockUserModelResponse(User.factory().create() as User);

            caller.setEndpoint('endpoint');
            await caller.delete();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            mockUserModelResponse(User.factory().create() as User);
            await caller.delete();

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should send query parameters in the request', async () => {
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
