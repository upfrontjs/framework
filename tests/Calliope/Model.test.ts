import Model from '../../src/Calliope/Model';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import { buildResponse, getLastFetchCall, mockUserModelResponse } from '../test-helpers';
import fetchMock from 'jest-fetch-mock';
import ModelCollection from '../../src/Calliope/ModelCollection';
import LogicException from '../../src/Exceptions/LogicException';

let user: User;

describe('Model', () => {
    beforeEach(() => {
        user = User.factory().create() as User;
        fetchMock.resetMocks();
    });

    describe('exists', () => {
        it('should correctly assert that the model exists', () => {
            expect(user.exists).toBe(true);
        });

        it('should consider if the primary key is select-text', () => {
            user.setAttribute(user.getKeyName(), undefined);

            expect(user.exists).toBe(false);
        });

        it('should consider that it has a created at date if using timestamp', () => {
            user.setAttribute(user.getCreatedAtColumn(), undefined);

            expect(user.exists).toBe(false);
        });

        it('should consider that it has soft deleted set if using soft deleted', () => {
            user.setAttribute(user.getDeletedAtColumn(), new Date().toISOString());

            expect(user.exists).toBe(false);
        });
    });

    describe('getKeyName()', () => {
        it('should return the primary key\'s name',  () => {
            expect(user.getKeyName()).toBe('id');
        });
    });

    describe('getName()', () => {
        it('should get the class name', () => {
            expect(user.getName()).toBe(User.name);
            expect((new Model).getName()).toBe(Model.name);
        });
    });

    describe('getKey()', () => {
        it('should return the primary key for the model',  () => {
            expect(user.getKey()).toBe(1);
            expect(user.setAttribute('id', 'value').getKey()).toBe('value');
        });
    });

    describe('is()', () => {
        it('should determine whether two models are the same',  () => {
            expect(user.is(1)).toBe(false);
            expect(user.is({})).toBe(false);
            expect(user.is({ id: user.getKey() })).toBe(false);
            expect(user.is(User.factory().create())).toBe(false);

            expect(user.is(user)).toBe(true);
        });
    });

    describe('isNot()', () => {
        it('should determine whether two models are not the same',  () => {
            expect(user.isNot(1)).toBe(true);
            expect(user.isNot({})).toBe(true);
            expect(user.isNot({ id: user.getKey() })).toBe(true);
            expect(user.isNot(User.factory().create())).toBe(true);

            expect(user.isNot(user)).toBe(false);
        });
    });

    describe('replicate()', () => {
        it('should replicate the model without timestamps and primary key', () => {
            user.setAttribute(user.getDeletedAtColumn(), new Date().toISOString());
            const replica = user.replicate();

            expect(replica.getAttribute(replica.getKeyName())).toBeUndefined();
            expect(replica.getAttribute(replica.getCreatedAtColumn())).toBeUndefined();
            expect(replica.getAttribute(replica.getUpdatedAtColumn())).toBeUndefined();
            expect(replica.getAttribute(replica.getDeletedAtColumn())).toBeUndefined();
        });

        it('should accept attribute keys that should be excluded at replication', () => {
            expect(user.replicate(['name']).name).toBeUndefined();
        });
    });

    describe('factory()', () => {
        it('should return the factory builder', () => {
            expect(User.factory()).toBeInstanceOf(FactoryBuilder);
        });
    });

    describe('find()', () => {
        it('should send a get request to the correct endpoint', async () => {
            mockUserModelResponse(user);
            await user.find(String(user.getKey()));

            expect(getLastFetchCall()?.method).toBe('get');
            expect(getLastFetchCall()?.url).toContain('/' + String(user.getKey()));
        });

        it('should return a model', async () => {
            mockUserModelResponse(user);
            const responseModel = await user.find(String(user.getKey()));

            expect(responseModel).toBeInstanceOf(User);
        });

        it('should be able to be called statically', async () => {
            mockUserModelResponse(user);
            const responseModel = await User.find(1);

            expect(responseModel).toBeInstanceOf(User);
        });
    });

    describe('findMany()', () => {
        it('should send a get request with query params', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().times(2).create())));
            await user.findMany([2, 3]);

            expect(getLastFetchCall()?.method).toBe('get');
            expect(getLastFetchCall()?.url).toContain(
                'wheres[][column]=id' +
                '&wheres[][operator]=in' +
                '&wheres[][value][]=2&wheres[][value][]=3' +
                '&wheres[][boolean]=and'
            );
        });

        it('should be able to be called statically', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(User.factory().times(2).create())));

            const response = await User.findMany([2, 3]);

            expect(response).toBeInstanceOf(ModelCollection);
        });
    });

    describe('refresh()', () => {
        it('should throw an error if the model doesn\'t exists', async () => {
            user.deleteAttribute(user.getKeyName());
            const failingFunc = jest.fn(async () => user.refresh());

            await expect(failingFunc).rejects.toThrow(new LogicException(
                'Attempted to refresh \'' + user.getName()
                + '\' when it has not been persisted yet.'
            ));
        });

        it('should send a get request', async () => {
            mockUserModelResponse(user);
            await user.refresh();

            expect(getLastFetchCall()?.method).toBe('get');
            expect(getLastFetchCall()?.url).toContain(user.getEndpoint().finish('/') + String(user.getKey()));
        });

        it('should refresh only the attributes that the model already has', async () => {
            mockUserModelResponse(user);
            await user.refresh();

            const params = 'columns[]=' + user.getAttributeKeys().reduce((previous, next) => {
                return previous + '&columns[]=' + next;
            });

            expect(getLastFetchCall()?.url).toContain(params);
        });
    });

    describe('all()', () => {
        it('should send a get request', async () => {
            mockUserModelResponse(user);
            await User.all();

            expect(getLastFetchCall()?.method).toBe('get');
        });

        it('should return all the models the backend has', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(
                buildResponse(User.factory().raw())
            ));

            const response = await User.all();

            expect(response).toBeInstanceOf(ModelCollection);
        });
    });

    describe('save()', () => {
        it('should return itself if there\'s nothing to save', async () => {
            const model = await user.save();

            expect(model).toBeInstanceOf(User);
            expect(getLastFetchCall()).toBeUndefined();
        });

        it('should save the given attributes', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({ name: 'new name' })));

            await user.save({ name: 'new name' });

            expect(user.name).toBe('new name');
        });

        it('should save the changed attributes', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({ name: 'new name' })));
            user.name = 'new name';

            await user.save();

            expect(user.name).toBe('new name');
        });

        it('should send a PATCH request if the model already exists', async () => {
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse({ name: 'new name' })));

            await user.save({ name: 'new name' });

            expect(getLastFetchCall()?.method).toBe('patch');
        });

        it('should send a POST request if the model not yet exists', async () => {
            user.name = 'new name';
            mockUserModelResponse(user);
            user.deleteAttribute(user.getKeyName());

            await user.save({});

            expect(getLastFetchCall()?.method).toBe('post');
        });
    });
});
