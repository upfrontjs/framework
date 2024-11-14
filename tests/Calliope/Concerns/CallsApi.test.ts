import LogicException from '../../../src/Exceptions/LogicException';
import fetchMock, { getLastRequest } from '../../mock/fetch-mock';
import API from '../../../src/Services/API';
import ApiResponseHandler from '../../../src/Services/ApiResponseHandler';
import User from '../../mock/Models/User';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import { config } from '../../setupTests';
import { snake, finish } from '../../../src/Support/string';
import type RequestMiddleware from '../../../src/Contracts/RequestMiddleware';
import transformKeys from '../../../src/Support/function/transformKeys';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
            fetchMock.mockResponseOnce(User.factory().raw());
            await caller.call('POST', { someValue: 1 });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(getLastRequest()?.body).toStrictEqual({ some_value: 1 });
        });

        it('should recursively cast the keys to any depth', async () => {
            fetchMock.mockResponseOnce(User.factory().raw());
            await caller.call('POST', {
                someValue: {
                    anotherValue: 1
                }
            });

            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(getLastRequest()?.body).toStrictEqual({ some_value: { another_value: 1 } });
        });

        it('should get the serverAttributeCasing from the extending model', async () => {
            fetchMock.mockResponseOnce(User.factory().raw());

            class UserWithSnakeCase extends User {
                protected override get serverAttributeCasing() {
                    return 'camel' as const;
                }
            }

            const user = new UserWithSnakeCase;

            await user.call('POST', {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                some_value: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    another_value: 1
                }
            });

            expect(getLastRequest()?.body).toStrictEqual({ someValue: { anotherValue: 1 } });
        });

        it('should not cast keys for form data', async () => {
            const formData = new FormData();
            // when appending fields, naming is very explicit, so we assume it is deliberate
            formData.append('my_field', 'value');
            fetchMock.mockResponseOnce(User.factory().raw());

            await caller.call('POST', formData);

            expect((getLastRequest()?.body as FormData).has('my_field')).toBe(true);
            expect((getLastRequest()?.body as FormData).has('myField')).toBe(false);
        });
    });

    describe('.endpoint', () => {
        it('should be a getter only string', () => {
            expect(typeof caller.endpoint).toBe('string');
            // @ts-expect-error
            expect(() => caller.endpoint = 'unexpected assignment').toThrowErrorMatchingInlineSnapshot(
                '[TypeError: Cannot set property endpoint of [object Object] which has only a getter]'
            );
        });
    });

    describe('call()', () => {
        it('should throw an error if no endpoint is defined',  async () => {
            caller.setEndpoint('');

            // awkward syntax comes from https://github.com/facebook/jest/issues/1700
            await expect(caller.call('GET')).rejects.toStrictEqual(
                new LogicException(
                    'Endpoint is not defined when calling \'GET\' method on \'' + caller.constructor.name + '\'.'
                )
            );
        });

        it('should get the endpoint from the model as expected', async () => {
            const baseEndpoint = config.get('baseEndPoint');
            fetchMock.mockResponseOnce({ data: 'value' });
            await caller.call('GET');
            // it adds the '/' between the baseEndPoint and the endpoint
            expect(getLastRequest()?.url).toBe(finish(baseEndpoint!, '/') + caller.getEndpoint());

            fetchMock.mockResponseOnce({ data: 'value' });
            config.unset('baseEndPoint');
            await caller.call('GET');
            // if no baseEndPoint is set, we have no leading '/'
            expect(getLastRequest()?.url).toBe(caller.getEndpoint());

            fetchMock.mockResponseOnce({ data: 'value' });
            config.set('baseEndPoint', baseEndpoint);
            caller.getEndpoint = () => 'https://test-domain.com/users';
            await caller.call('GET');
            // it just appends the value regardless of if it's a valid url
            expect(getLastRequest()?.url).toBe(finish(baseEndpoint!, '/') + caller.getEndpoint());

            fetchMock.resetMocks();
        });

        it('should return a promise with the response',  async () => {
            fetchMock.mockResponseOnce(User.factory().raw());
            const responseData = await caller.call('GET');

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

            fetchMock.mockResponseOnce({ data: 'value' });
            await caller.call('GET');
            expect(getLastRequest()?.headers.has('custom')).toBe(true);
            expect(getLastRequest()?.headers.get('custom')).toBe('header');
        });

        it('should get the HandlesApiResponse from the Configuration if set',  async () => {
            const mockFn = vi.fn();
            const apiResponseHandler = class CustomApiResponseHandlerImplementation extends ApiResponseHandler {
                public override handleFinally() {
                    mockFn();
                }
            };

            config.set('apiResponseHandler', apiResponseHandler);

            fetchMock.mockResponseOnce({ data: 'value' });
            await caller.call('GET');
            expect(mockFn).toHaveBeenCalled();
        });

        it('should internally count the number of ongoing requests', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne().getRawOriginal());
            const promise1 = caller.call('GET');
            fetchMock.mockResponseOnce(User.factory().createOne().getRawOriginal());
            const promise2 = caller.call('GET');

            // @ts-expect-error
            expect(caller.requestCount).toBe(2);

            await Promise.all([promise1, promise2]);

            // @ts-expect-error
            expect(caller.requestCount).toBe(0);

            fetchMock.resetMocks();
        });

        it('should determine whether there is an ongoing request or not', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne().getRawOriginal());

            const promise = caller.call('GET');

            expect(caller.loading).toBe(true);

            await promise;

            expect(caller.loading).toBe(false);
        });

        it('should set the given data to the .serverAttributeCasing', async () => {
            fetchMock.mockResponseOnce(User.factory().makeOne());
            await caller.call('POST', {
                myKey1: null,
                myKey2: { some: { deepNested: 'value' } },
                myKey3: false,
                myKey4: 0
            });

            expect(getLastRequest()?.body).toStrictEqual({
                /* eslint-disable @typescript-eslint/naming-convention */
                my_key_1: null,
                my_key_2: { some: { deep_nested: 'value' } },
                my_key_3: false,
                my_key_4: 0
                /* eslint-enable @typescript-eslint/naming-convention */
            });
        });

        it('should send all the given data', async () => {
            fetchMock.mockResponseOnce(User.factory().makeOne());
            await caller.call('POST', {
                falsyKey1: null,
                falsyKey2: undefined,
                falsyKey3: false,
                falsyKey4: 0
            });

            // undefined is filtered out by JSON.stringify() on the API service
            expect(getLastRequest()?.body).toStrictEqual({
                /* eslint-disable @typescript-eslint/naming-convention */
                falsy_key_1: null,
                falsy_key_3: false,
                falsy_key_4: 0
                /* eslint-enable @typescript-eslint/naming-convention */
            });
        });

        it('should not parse the response body if data wrapped', async () => {
            const data = User.factory().rawOne();
            fetchMock.mockResponseOnce({ data });
            const parsedResponse = await caller.call('GET');

            expect(parsedResponse.data).toStrictEqual(data);
        });

        it('should reset the endpoint', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne());

            caller.setEndpoint('endpoint');
            await caller.get();
            expect(caller.getEndpoint()).toBe('users');
        });

        it('should reset the query parameters', async () => {
            caller.whereKey(43);
            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toHaveLength(1);

            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.get();

            // @ts-expect-error
            expect(caller.compileQueryParameters().wheres).toBeUndefined();
        });

        it('should return undefined if the response from the handler is undefined', async () => {
            fetchMock.mockResponseOnce(undefined, { status: 204 });
            await expect(caller.call('GET')).resolves.toBeUndefined();
        });

        describe('requestMiddleware', () => {
            it('should run the given request middleware if set in the configuration', async () => {
                fetchMock.mockResponseOnce(User.factory().raw());
                const mockFn = vi.fn();
                const requestMiddleware: RequestMiddleware = {
                    handle: (url, method, data, customHeaders, queryParameters) => {
                        mockFn(url, method, data, customHeaders, queryParameters);
                        return {
                            data: {
                                ...data,
                                newKey: 'new value'
                            },
                            customHeaders: {
                                ...customHeaders,
                                newHeader: 'new value'
                            },
                            queryParameters: {
                                ...queryParameters,
                                key: 'value'
                            }
                        };
                    }
                };

                config.set('requestMiddleware', requestMiddleware);

                await caller.whereKey(1).call(
                    'post',
                    { key: 'value' },
                    { header: 'value' }
                );

                expect(mockFn).toHaveBeenCalled();
                expect(mockFn).toHaveBeenCalledWith(
                    finish(config.get('baseEndPoint')!, '/') + caller.getEndpoint(),
                    'post',
                    { key: 'value' },
                    { header: 'value' },
                    { wheres: [{ boolean: 'and', column: 'id', operator: '=', value: 1 }] }
                );
                expect(getLastRequest()!.headers.get('header')).toBe('value');
                expect(getLastRequest()!.headers.get('newHeader')).toBe('new value');
                expect(getLastRequest()!.body).toStrictEqual({
                    key: 'value',
                    newKey: 'new value'
                });
                expect(getLastRequest()!.url).toBe(
                    finish(config.get('baseEndPoint')!, '/') + caller.getEndpoint() +
                    '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=1&wheres[0][boolean]=and&key=value'
                );

                config.unset('requestMiddleware');
            });

            it('should only override the values if the returned values' +
                'either undefined or object literals', async () => {
                let requestMiddleware: RequestMiddleware = {
                    handle: () => ({ customHeaders: { header: 'new value' } })
                };
                config.set('requestMiddleware', requestMiddleware);

                fetchMock.mockResponseOnce(User.factory().raw());
                await caller.call(
                    'POST',
                    { key: 'value' },
                    { header: 'value' }
                );

                let lastRequest = getLastRequest();
                expect(lastRequest!.body).toStrictEqual({ key: 'value' });
                expect(lastRequest!.headers.get('header')).toBe('new value');

                requestMiddleware = {
                    handle: () => ({
                        queryParameters: { key: 'new value' },
                        customHeaders: {}
                    })
                };
                config.set('requestMiddleware', requestMiddleware);

                fetchMock.mockResponseOnce(User.factory().raw());
                await caller.call(
                    'GET',
                    { key: 'value' },
                    { header: 'value' }
                );

                lastRequest = getLastRequest();
                expect(lastRequest!.body).toBeUndefined();
                expect(lastRequest!.url).toBe(
                    finish(config.get('baseEndPoint')!, '/') + caller.getEndpoint() + '?key=value'
                );
                expect(lastRequest!.headers.has('header')).toBe(false);

                config.unset('requestMiddleware');
            });
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
            expect(caller.newInstanceFromResponseData(userData)).toStrictEqual(User.make(userData).setLastSyncedAt());
        });

        it('should construct a model collection on array argument', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().rawOne();
            //@ts-expect-error
            expect(caller.newInstanceFromResponseData([userData]))
                .toStrictEqual(new ModelCollection([User.make(userData).setLastSyncedAt()]));
        });

        it('should force fill the models from the response', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const userData = User.factory().rawOne();
            const expectedUser = User.make(userData);

            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalFillableReturn =  User.prototype.getFillable;

            User.prototype.getFillable = () => [];

            //@ts-expect-error
            const callerModel = caller.newInstanceFromResponseData(userData);

            expect(callerModel.getAttributes()).toStrictEqual(expectedUser.getAttributes());
            expect(callerModel.getRawOriginal()).toStrictEqual(expectedUser.getRawOriginal());

            User.prototype.getFillable = originalFillableReturn;
        });

        it('should set _lastSyncedAt or _last_synced_at getter on the model or model collection', () => {
            const userData = User.factory().rawOne();

            //@ts-expect-error
            const user = caller.newInstanceFromResponseData(userData);
            // @ts-expect-error
            expect(user['_' + String(user.setStringCase('last_synced_at'))]).toStrictEqual(new Date);

            const usersData = User.factory().times(2).rawMany();

            // @ts-expect-error
            const users = caller.newInstanceFromResponseData(usersData.toArray());

            users.forEach(userModel => {
                // @ts-expect-error
                expect(userModel['_' + String(userModel.setStringCase('last_synced_at'))]).toStrictEqual(new Date);
            });
        });
    });

    describe('setLastSyncedAt()', () => {
        it('should set the attribute with the correct casing', () => {
            caller.setLastSyncedAt();
            expect(caller._last_synced_at).toBeUndefined();
            expect(caller._lastSyncedAt).toBeDefined();
            Object.defineProperty(caller, 'attributeCasing', { get: () => 'snake' });

            caller.setLastSyncedAt();
            expect(caller._last_synced_at).toBeDefined();
            // if you update the string casing on the fly, that's on you.
            // you might end up with _lastSyncedAt and _last_synced_at at the same time
        });

        it('should return itself ready for chaining', () => {
            expect(caller.setLastSyncedAt()).toBeInstanceOf(User);
        });

        it('should update the attribute with the new Date', () => {
            caller.setLastSyncedAt();
            expect(caller._lastSyncedAt).toStrictEqual(new Date);
        });

        it('should throw an error when invalid value given', () => {
            caller.setLastSyncedAt('invalid value');
            expect(() => caller._lastSyncedAt).toThrow(
                new LogicException('\'_lastSyncedAt\' is not castable to a date time in \'' + caller.getName() + '\'.')
            );
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

        it('should kebab-case multi word models', () => {
            Object.defineProperty(caller, 'endpoint', {
                get: () => ''
            });
            caller.getName = () => 'MyModel';

            caller.resetEndpoint();

            expect(caller.getEndpoint()).toBe('my-models');
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
            const user = User.factory().createOne();
            fetchMock.mockResponseOnce(user);

            await caller.get();
            expect(getLastRequest()?.method).toBe('GET');
        });

        it('should return a promise with new model or model collection', async () => {
            const user = User.factory().createOne();
            fetchMock.mockResponseOnce(user);

            const data = await caller.get();
            expect(data).toStrictEqual(user);
        });

        it('should take parameters for the request', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.get({ myParam: 1 });

            expect(getLastRequest()?.url)
                .toBe(`${config.get('baseEndPoint')!}/${caller.getEndpoint()}?${snake('myParam')}=1`);
        });

        it('should overwrite query parameters from the builder', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.whereKey(1).get({
                wheres: [
                    {
                        column: caller.getKeyName(),
                        operator: '=',
                        value: 2,
                        boolean: 'and'
                    }
                ]
            });

            expect(getLastRequest()?.url)
                .toBe(`${config.get('baseEndPoint')!}/${caller.getEndpoint()}`
                    + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=2&wheres[0][boolean]=and');
        });

        it('should send query parameters in the request', async () => {
            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.whereKey(43).get();

            expect(getLastRequest()?.url).toBe(
                String(config.get('baseEndPoint')) + '/'
                + caller.getEndpoint()
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=43&wheres[0][boolean]=and'
            );
        });

        it('should works statically', async () => {
            const user = User.factory().createOne().getAttributes();
            fetchMock.mockResponseOnce(transformKeys(user));

            const data = (await User.get()) as User;

            expect(data.getAttributes()).toStrictEqual(user);
        });

        it('should unwrap data if response comes data wrapped', async () => {
            const user = User.factory().createOne();

            fetchMock.mockResponseOnce({ data: [user.getAttributes()] }, { status: 200 });

            let data = await User.get();
            expect(data).toBeInstanceOf(ModelCollection);

            fetchMock.mockResponseOnce([user.getAttributes()], { status: 200 });
            data = await User.get();

            expect(data).toBeInstanceOf(ModelCollection);
        });
    });

    describe('post()', () => {
        it('should send a POST request', async () => {
            fetchMock.mockResponseOnce(caller);
            await caller.post({ key: 'value' });

            expect(getLastRequest()?.method).toBe('POST');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().createOne();
            const callerUser = User.factory().createOne();

            // if response returns model data
            fetchMock.mockResponseOnce(responseUser);
            let returnModel = await callerUser.post(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce('1');
            returnModel = await callerUser.post({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should send query parameters in the url', async () => {
            caller.whereKey(43);

            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.post({ key: 'value' });

            expect(getLastRequest()?.body).toStrictEqual({ key: 'value' });
            expect(getLastRequest()?.url).toBe(
                `${config.get('baseEndPoint')!}/${caller.getEndpoint()}`
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=43&wheres[0][boolean]=and'
            );
        });
    });

    describe('put()', () => {
        it('should send a PUT request', async () => {
            fetchMock.mockResponseOnce(caller);
            await caller.put({ key: 'value' });

            expect(getLastRequest()?.method).toBe('PUT');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().createOne();
            const callerUser = User.factory().createOne();

            // if response returns model data
            fetchMock.mockResponseOnce(responseUser);
            let returnModel = await callerUser.put(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce('1');
            returnModel = await callerUser.put({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should send query parameters in the url', async () => {
            caller.whereKey(43);

            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.put({ key: 'value' });

            expect(getLastRequest()?.body).toStrictEqual({ key: 'value' });
            expect(getLastRequest()?.url).toBe(
                `${config.get('baseEndPoint')!}/${caller.getEndpoint()}`
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=43&wheres[0][boolean]=and'
            );
        });
    });

    describe('patch()', () => {
        it('should send a PATCH request', async () => {
            fetchMock.mockResponseOnce(caller);
            await caller.patch({ key: 'value' });

            expect(getLastRequest()?.method).toBe('PATCH');
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().createOne();
            const callerUser = User.factory().createOne();

            // if response returns model data
            fetchMock.mockResponseOnce(responseUser);
            let returnModel = await callerUser.patch(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce('1');
            returnModel = await callerUser.patch({ key: 'value' });

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should send query parameters in the url', async () => {
            caller.whereKey(43);

            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.patch({ key: 'value' });

            expect(getLastRequest()?.body).toStrictEqual({ key: 'value' });
            expect(getLastRequest()?.url).toBe(
                `${config.get('baseEndPoint')!}/${caller.getEndpoint()}`
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=43&wheres[0][boolean]=and'
            );
        });
    });

    describe('delete()', () => {
        it('should send a DELETE request', async () => {
            fetchMock.mockResponseOnce(caller);
            await caller.delete();

            expect(getLastRequest()?.method).toBe('DELETE');
        });

        it('should send information in the request body', async () => {
            fetchMock.mockResponseOnce(caller);
            await caller.delete({ key: 'value' });

            expect(getLastRequest()?.body).toStrictEqual({ key: 'value' });
        });

        it('should return this or new model depending on the response', async () => {
            const responseUser = User.factory().createOne();
            responseUser.usesSoftDeletes = () => false;
            const callerUser = User.factory().createOne();
            callerUser.usesSoftDeletes = () => false;

            // if response returns model data
            fetchMock.mockResponseOnce(responseUser);
            let returnModel = await callerUser.delete(responseUser.getRawOriginal());

            // a new model will be returned using the response data
            expect(callerUser).not.toStrictEqual(returnModel);

            // if response isn't model data
            fetchMock.mockResponseOnce('1');
            returnModel = await callerUser.delete();

            // the returned model is the calling model
            expect(callerUser).toStrictEqual(returnModel);
        });

        it('should send query parameters in the url', async () => {
            caller.whereKey(43);

            fetchMock.mockResponseOnce(User.factory().createOne());
            await caller.delete();

            expect(getLastRequest()?.url).toBe(
                `${config.get('baseEndPoint')!}/${caller.getEndpoint()}`
                + '?wheres[0][column]=id&wheres[0][operator]=%3D&wheres[0][value]=43&wheres[0][boolean]=and'
            );
        });
    });
});
