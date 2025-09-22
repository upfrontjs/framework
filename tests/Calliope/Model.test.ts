import Model from '../../src/Calliope/Model';
import User from '../mock/Models/User';
import FactoryBuilder from '../../src/Calliope/Factory/FactoryBuilder';
import fetchMock, { getLastRequest } from '../mock/fetch-mock';
import ModelCollection from '../../src/Calliope/ModelCollection';
import LogicException from '../../src/Exceptions/LogicException';
import { finish, snake } from '../../src/Support/string';
import Team from '../mock/Models/Team';
import { config } from '../setupTests';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let user: User;

describe('Model', () => {
    beforeEach(() => {
        user = User.factory().createOne();
        fetchMock.resetMocks();
    });

    describe('exists', () => {
        it('should correctly assert that the model exists', () => {
            expect(user.exists).toBe(true);
        });

        it('should consider if the primary key is set', () => {
            user.setAttribute(user.getKeyName(), undefined);

            expect(user.exists).toBe(false);
        });

        it('should accept any string id that has length as valid', () => {
            Object.defineProperty(user, 'keyType', {
                get: () => 'string',
                configurable: true
            });
            user.setAttribute(user.getKeyName(), '');
            expect(user.exists).toBe(false);

            user.setAttribute(user.getKeyName(), 'unique-id');
            expect(user.exists).toBe(true);

            Object.defineProperty(user, 'keyType', {
                get: () => 'number'
            });
        });

        it('should consider that it has a created at date if using timestamp', () => {
            user.setAttribute(user.getCreatedAtName(), undefined);

            expect(user.exists).toBe(false);
        });

        it('should consider that it has soft deleted set if using soft deleted', () => {
            user.setAttribute(user.getDeletedAtName(), new Date().toISOString());

            expect(user.exists).toBe(false);
        });

        it('should consider the _last_synced_at attribute', () => {
            delete user._lastSyncedAt;
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
        });

        it('should throw an error if class doesn\'t override', () => {
            expect(() => (new Model).getName()).toThrow(
                new Error('Your model has to define the getName method.')
            );
        });
    });

    describe('when()', () => {
        it('should call the given closure depending on the truthiness if the first argument', () => {
            user.when(false, userInstance => userInstance.setAttribute('test', 1));

            expect(user.getAttribute('test')).toBeUndefined();

            user.when(true, userInstance => userInstance.setAttribute('test', 1));

            expect(user.getAttribute('test')).toBe(1);
        });

        it('should resolve if first argument is closure', () => {
            const fn = vi.fn(() => true);

            expect(user.when(fn, u => u.setAttribute('test', 1)).getAttribute('test')).toBe(1);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should pass a clone to the first argument if it\' a function', () => {
            const fn = vi.fn((u: User) => {
                u.setAttribute('test', 2);

                return user.is(u);
            });

            expect(user.when(fn, u => u.setAttribute('test', 1)).getAttribute('test')).toBe(1);
        });
    });

    describe('unless()', () => {
        it('should call the given closure depending on the falsy state of the first argument', () => {
            user.unless(true, userInstance => userInstance.setAttribute('test', 1));

            expect(user.getAttribute('test')).toBeUndefined();

            user.unless(false, userInstance => userInstance.setAttribute('test', 1));

            expect(user.getAttribute('test')).toBe(1);
        });

        it('should resolve if first argument is closure', () => {
            const fn = vi.fn(() => false);

            expect(user.unless(fn, u => u.setAttribute('test', 1)).getAttribute('test')).toBe(1);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should pass a clone to the first argument if it\' a function', () => {
            const fn = vi.fn((u: User) => {
                u.setAttribute('test', 2);

                return user.isNot(u);
            });

            expect(user.unless(fn, u => u.setAttribute('test', 1)).getAttribute('test')).toBe(1);
        });
    });

    describe('tap()', () => {
        it('should pass the model into the given function', () => {
            const cb = vi.fn((model: User) => {
                model.setAttribute('test', 1);
                return model.is(user);
            });

            user.tap(cb);
            expect(cb).toHaveReturnedWith(true);
            expect(user.getAttribute('test')).toBeUndefined();
        });

        it('should pass a clone to the given function', () => {
            user.setAttribute('test', 1)
                .tap((model) => {
                    model.setAttribute('test', 2);
                });
            expect(user.getAttribute('test')).toBe(1);
            user.deleteAttribute('test');
        });
    });

    describe('getKey()', () => {
        it('should return the primary key for the model',  () => {
            expect(user.getKey()).toBe(1);
            expect(user.setAttribute('id', 'value').getKey()).toBe('value');
        });
    });

    describe('new()', () => {
        it('should give a new instance of the model', () => {
            expect(user.new({ key: 'myString' })).toBeInstanceOf(User);
            expect(user.is(user.new({ key: 'myString' }))).toBe(false);
        });
    });

    describe('make()', () => {
        it('should return a new instance', () => {
            expect(User.make()).toBeInstanceOf(User);
        });

        it('should have the capabilities of the model', () => {
            expect(User.make({ key: 'value' }).getAttribute('key')).toBe('value');
        });

        it('should set up magic access for accessors', () => {
            class ModelWithAccessor extends User {
                public override get fillable(): string[] {
                    return ['*'];
                }

                public override getName() {
                    return 'ModelWithProperties';
                }

                public getTestAttribute() {
                    return 1;
                }
            }

            expect(ModelWithAccessor.make({ key: 'value' }).test).toBe(1);
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
            user.setAttribute(user.getDeletedAtName(), new Date().toISOString());
            const replica = user.replicate();

            expect(replica.getAttribute(replica.getKeyName())).toBeUndefined();
            expect(replica.getAttribute(replica.getCreatedAtName())).toBeUndefined();
            expect(replica.getAttribute(replica.getUpdatedAtName())).toBeUndefined();
            expect(replica.getAttribute(replica.getDeletedAtName())).toBeUndefined();
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
            const team = Team.factory().createOne();
            user.setAttribute('teamId', team.getKey());
            user.addRelation('team', team);

            const replica = user.replicate();
            expect((replica.getRelation('team') as Team).getKey()).toBe(team.getKey());

            const replica2 = user.replicate(['team']);
            expect(replica2.relationLoaded('team')).toBe(false);
        });
    });

    describe('clone', () => {
        it('should return a clone of the given model', () => {
            expect(user.is(user.clone())).toBe(true);
        });

        it('should clone the model in it\'s current state', () => {
            user = User.make({ id: 1, myKey: 2 });
            user.setFillable(['id', 'something']);
            user.setGuarded(['*']);
            user.setCasts({ id: 'number' });
            user.setAttribute('myKey', 3);
            const userClone = user.clone();

            expect(userClone.getRawAttributes()).toStrictEqual(user.getRawAttributes());
            expect(userClone.getRawOriginal()).toStrictEqual(user.getRawOriginal());
            expect(userClone.hasCast('id')).toBe(true);
        });

        it('should clone the model with any interim state', () => {
            const shift = user.$shifts().setEndpoint('myEndpoint');
            const shiftClone = shift.clone();

            expect(shiftClone.getEndpoint()).toBe(shift.getEndpoint());
            // @ts-expect-error
            expect(shiftClone.hasOneOrManyParentKeyName).toBe(shift.hasOneOrManyParentKeyName);
        });

        it('should clone the model with query values retained', () => {
            user.whereKey(1).with('relation').page(2);
            // @ts-expect-error
            expect(user.clone().compileQueryParameters()).toStrictEqual(user.compileQueryParameters());
        });

        it('should not copy values by reference', () => {
            user.setAttribute('myKey', 1);
            const userClone = user.clone();
            user.setAttribute('myKey', 2);

            expect(userClone.getAttribute('myKey')).toBe(1);
        });

        it('should should clone the last synced at value', () => {
            // @ts-expect-error - this is acceptable for the sake of test
            const lastSyncKey = '_' + user.setStringCase('last_synced_at');
            expect(String(user.clone()[lastSyncKey])).toBe(String(user[lastSyncKey]));
        });
    });

    describe('factory()', () => {
        it('should return the factory builder', () => {
            expect(User.factory()).toBeInstanceOf(FactoryBuilder);
        });

        it('should optionally set the amount if given as argument', () => {
            expect(User.factory(2).create()).toBeInstanceOf(ModelCollection);
            expect(User.factory(2).create()).toHaveLength(2);
        });
    });

    describe('find()', () => {
        it('should send a GET request to the correct endpoint', async () => {
            fetchMock.mockResponseOnce(user);
            await User.find(1);

            expect(getLastRequest()?.method).toBe('GET');
            expect(getLastRequest()?.url).toContain('/' + String(user.getKey()));
        });

        it('should return a model', async () => {
            fetchMock.mockResponseOnce(user);
            const responseModel = await User.find(1);

            expect(responseModel).toBeInstanceOf(User);
        });
    });

    describe('findMany()', () => {
        it('should send a GET request with query params', async () => {
            fetchMock.mockResponseOnce(User.factory().times(2).createMany());
            await User.findMany([2, 3]);

            expect(getLastRequest()?.method).toBe('GET');
            expect(getLastRequest()?.url).toBe(
                config.get('baseEndPoint')! + '/' +
                user.getEndpoint() + '?' +
                'wheres[0][column]=id' +
                '&wheres[0][operator]=in' +
                '&wheres[0][value][0]=2&wheres[0][value][1]=3' +
                '&wheres[0][boolean]=and'
            );
        });

        it('should return a ModelCollection even if only one model returned', async () => {
            fetchMock.mockResponseOnce(User.factory().rawOne(), { status: 200 });
            const users = await User.findMany([1]);

            expect(users).toBeInstanceOf(ModelCollection);
            expect(users).toHaveLength(1);
        });
    });

    describe('refresh()', () => {
        it('should throw an error if the model doesn\'t exists', async () => {
            user.deleteAttribute(user.getKeyName());
            const failingFunc = vi.fn(async () => user.refresh());

            await expect(failingFunc).rejects.toThrow(new LogicException(
                'Attempted to call refresh on \'' + user.getName()
                + '\' when it has not been persisted yet or it has been soft deleted.'
            ));
        });

        it('should send a GET request', async () => {
            fetchMock.mockResponseOnce(user);
            await user.refresh();

            expect(getLastRequest()?.method).toBe('GET');
            expect(getLastRequest()?.url).toContain(finish(user.getEndpoint(), '/') + String(user.getKey()));
        });

        it('should refresh only the attributes that the model already has', async () => {
            fetchMock.mockResponseOnce(user);
            await user.refresh();

            const params = 'columns[0]=' + user.getAttributeKeys().reduce((previous, next, index) => {
                return previous + '&columns[' + String(index) + ']=' + next;
            });

            expect(getLastRequest()?.url).toContain(params);
        });

        it('should return the model itself', async () => {
            fetchMock.mockResponseOnce(user);
            const returnUser = await user.refresh();
            returnUser.name = 'new name';

            expect(user.name).toBe('new name');
        });

        it('should clear the changes on the model', async () => {
            fetchMock.mockResponseOnce(user);
            user.name = 'new name';
            expect(user.getChanges()).not.toStrictEqual({});
            await user.refresh();
            expect(user.getChanges()).toStrictEqual({});
        });

        it('should update the last synced at', async () => {
            fetchMock.mockResponseOnce(user);
            const lastSyncedAt = user._lastSyncedAt;

            vi.advanceTimersByTime(100);
            await user.refresh();

            expect(user._lastSyncedAt).not.toBe(lastSyncedAt);
        });
    });

    describe('all()', () => {
        it('should send a GET request', async () => {
            fetchMock.mockResponseOnce(user);
            await User.all();

            expect(getLastRequest()?.method).toBe('GET');
        });

        it('should return a ModelCollection', async () => {
            fetchMock.mockResponseOnce(User.factory().raw());

            let response = await User.all();
            expect(response).toBeInstanceOf(ModelCollection);
            expect(response).toHaveLength(1);

            fetchMock.mockResponseOnce(User.factory(2).raw());

            response = await User.all();
            expect(response).toBeInstanceOf(ModelCollection);
            expect(response).toHaveLength(2);
        });
    });

    describe('save()', () => {
        it('should return itself if there\'s nothing to save', async () => {
            const model = await user.save();

            expect(model).toBeInstanceOf(User);
            expect(getLastRequest()).toBeUndefined();
        });

        it('should save the given attributes', async () => {
            fetchMock.mockResponseOnce({ name: 'new name' });

            await user.save({ name: 'new name' });

            expect(user.name).toBe('new name');
        });

        it('should save the changed attributes', async () => {
            fetchMock.mockResponseOnce({ name: 'new name' });
            user.name = 'new name';

            await user.save();

            expect(user.name).toBe('new name');
        });

        it('should send a PATCH request if the model already exists', async () => {
            fetchMock.mockResponseOnce({ name: 'new name' });

            await user.save({ name: 'new name' });

            expect(getLastRequest()?.method).toBe('PATCH');
            expect(getLastRequest()?.url).toContain(finish(user.getEndpoint(), '/') + String(user.getKey()));
        });

        it('should send a POST request if the model not yet exists', async () => {
            user.name = 'new name';
            fetchMock.mockResponseOnce(user);
            user.deleteAttribute(user.getKeyName());

            await user.save({});

            expect(getLastRequest()?.method).toBe('POST');
        });

        it('should send all attributes if model doesn\'t exist', async () => {
            const thisUser = User.factory().makeOne({ myAttr: 1 });
            fetchMock.mockResponseOnce(thisUser);

            await thisUser.save({ customAttr: 1 });


            expect(getLastRequest()?.body).toStrictEqual({
                /* eslint-disable @typescript-eslint/naming-convention */
                my_attr: 1,
                custom_attr: 1,
                name: thisUser.name,
                [snake(thisUser.getCreatedAtName())]: null,
                [snake(thisUser.getUpdatedAtName())]: null,
                [snake(thisUser.getDeletedAtName())]: null
                /* eslint-enable @typescript-eslint/naming-convention */
            });
        });

        it('should sync changes after the request', async () => {
            user.name = 'new name';
            fetchMock.mockResponseOnce(user.getRawAttributes());

            expect(user.getChanges('name').name).toBe('new name');
            await user.save();
            expect(user.getChanges('name').name).toBeUndefined();
        });

        it('should update the last synced at', async () => {
            fetchMock.mockResponseOnce(user);
            const lastSyncedAt = user._lastSyncedAt;
            user.name = 'new name';

            vi.advanceTimersByTime(100);
            await user.save();

            expect(user._lastSyncedAt).not.toBe(lastSyncedAt);
        });

        describe('relations', () => {
            it('should send the id as part of the body without the get params ' +
                'when using hasOne to instantiate model', async () => {
                const contract = user.$contract();

                fetchMock.mockResponseOnce({
                    myAttribute: 'value',
                    [user.guessForeignKeyName()]: user.getKey()
                });

                await contract.save({ myAttribute: 'value' });

                const lastRequest = getLastRequest();
                expect(lastRequest?.url).toBe(String(config.get('baseEndPoint')) + '/' + contract.getEndpoint());
                expect(lastRequest?.method).toBe('POST');
                expect(lastRequest?.body).toStrictEqual({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    my_attribute: 'value',
                    [snake(user.guessForeignKeyName())]: user.getKey()
                });
            });

            it('should send the id as part of the body without the get params ' +
                'when using hasMany to instantiate model', async () => {
                const shift = user.$shifts();

                fetchMock.mockResponseOnce({
                    myAttribute: 'value',
                    [user.guessForeignKeyName()]: user.getKey()
                });

                await shift.save({ myAttribute: 'value' });

                const lastRequest = getLastRequest();
                expect(lastRequest?.url).toBe(String(config.get('baseEndPoint')) + '/' + shift.getEndpoint());
                expect(lastRequest?.method).toBe('POST');
                expect(lastRequest?.body).toStrictEqual({
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    my_attribute: 'value',
                    [snake(user.guessForeignKeyName())]: user.getKey()
                });
            });
        });
    });

    describe('update()', () => {
        it('should call the patch() method', async () => {
            fetchMock.mockResponseOnce(user);
            await user.update({ key: 'value' });

            expect(getLastRequest()?.method).toBe('PATCH');
        });

        it('should set the correct endpoint', async () => {
            fetchMock.mockResponseOnce(user);

            await user.update({ key: 'value' });
            expect(getLastRequest()?.url).toBe(
                String(config.get('baseEndPoint')) + '/' + user.getEndpoint() + '/' + String(user.getKey())
            );
        });

        it('should throw an error if the model not yet exists', async () => {
            const nonExistentUser = User.factory().makeOne();

            await expect(async () => nonExistentUser.update({ myAttrs: 1 })).rejects.toThrow(
                new LogicException(
                    'Attempted to call update on \'' + nonExistentUser.getName()
                    + '\' when it has not been persisted yet or it has been soft deleted.'
                )
            );
        });
    });
});
