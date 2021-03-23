import Model from '../../src/Calliope/Model';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import { buildResponse, getLastFetchCall, mockUserModelResponse } from '../test-helpers';
import fetchMock from 'jest-fetch-mock';
import ModelCollection from '../../src/Calliope/ModelCollection';
import LogicException from '../../src/Exceptions/LogicException';
import { finish, snake } from '../../src/Support/string';
import { advanceBy } from 'jest-date-mock';
import Team from '../mock/Models/Team';

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

        it('should consider the _last_synced_at attribute', () => {
            // @ts-expect-error
            user.setLastSyncedAt(false);
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
            expect(user.replicate('name').name).toBeUndefined();
        });

        it('should use raw values', () => {
            const originalName = user.name;
            user.getNameAttribute = () => 'some random value';
            expect(user.name).toBe('some random value');

            expect(user.replicate().name).toBe(originalName);
        });

        it('should clone relations', () => {
            const team = Team.factory().create() as Team;
            user.setAttribute('teamId', team.getKey());
            user.addRelation('team', team);

            const replica = user.replicate();
            expect((replica.getRelation('team') as Team).getKey()).toBe(team.getKey());

            const replica2 = user.replicate(['team']);
            expect(replica2.relationLoaded('team')).toBe(false);
        });
    });

    describe('factory()', () => {
        it('should return the factory builder', () => {
            expect(User.factory()).toBeInstanceOf(FactoryBuilder);
        });
    });

    describe('find()', () => {
        it('should send a GET request to the correct endpoint', async () => {
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
        it('should send a GET request with query params', async () => {
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
                'Attempted to call refresh on \'' + user.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });

        it('should send a GET request', async () => {
            mockUserModelResponse(user);
            await user.refresh();

            expect(getLastFetchCall()?.method).toBe('get');
            expect(getLastFetchCall()?.url).toContain(finish(user.getEndpoint(), '/') + String(user.getKey()));
        });

        it('should refresh only the attributes that the model already has', async () => {
            mockUserModelResponse(user);
            await user.refresh();

            const params = 'columns[]=' + user.getAttributeKeys().reduce((previous, next) => {
                return previous + '&columns[]=' + next;
            });

            expect(getLastFetchCall()?.url).toContain(params);
        });

        it('should return the model itself', async () => {
            mockUserModelResponse(user);
            const returnUser = await user.refresh();
            returnUser.name = 'new name';

            expect(user.name).toBe('new name');
        });

        it('should clear the changes on the model', async () => {
            mockUserModelResponse(user);
            user.name = 'new name';
            expect(user.getChanges()).not.toStrictEqual({});
            await user.refresh();
            expect(user.getChanges()).toStrictEqual({});
        });

        it('should update the last synced at', async () => {
            mockUserModelResponse(user);
            const lastSyncedAt = user._lastSyncedAt;

            advanceBy(100);
            await user.refresh();

            expect(user._lastSyncedAt).not.toBe(lastSyncedAt);
        });
    });

    describe('all()', () => {
        it('should send a GET request', async () => {
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
            expect(getLastFetchCall()?.url).toContain(finish(user.getEndpoint(), '/') + String(user.getKey()));
        });

        it('should send a POST request if the model not yet exists', async () => {
            user.name = 'new name';
            mockUserModelResponse(user);
            user.deleteAttribute(user.getKeyName());

            await user.save({});

            expect(getLastFetchCall()?.method).toBe('post');
        });

        it('should send all attributes if model doesn\'t exist', async () => {
            const thisUser = User.factory().make({ myAttr: 1 }) as User;
            mockUserModelResponse(thisUser);

            await thisUser.save({ customAttr: 1 });


            expect(getLastFetchCall()?.body).toStrictEqual({
                /* eslint-disable @typescript-eslint/naming-convention */
                my_attr: 1,
                custom_attr: 1,
                name: thisUser.name,
                [snake(thisUser.getCreatedAtColumn())]: null,
                [snake(thisUser.getUpdatedAtColumn())]: null,
                [snake(thisUser.getDeletedAtColumn())]: null
                /* eslint-enable @typescript-eslint/naming-convention */
            });
        });

        it('should sync changes after the request', async () => {
            user.name = 'new name';
            fetchMock.mockResponseOnce(async () => Promise.resolve(buildResponse(user.getRawAttributes())));

            expect(user.getChanges('name').name).toBe('new name');
            await user.save();
            expect(user.getChanges('name').name).toBeUndefined();
        });

        it('should update the last synced at', async () => {
            mockUserModelResponse(user);
            const lastSyncedAt = user._lastSyncedAt;
            user.name = 'new name';

            advanceBy(100);
            await user.save();

            expect(user._lastSyncedAt).not.toBe(lastSyncedAt);
        });
    });
});
