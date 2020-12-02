import FactoryBuilder from '../../../src/Calliope/Factory/FactoryBuilder';
import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import InvalidOffsetException from '../../../src/Exceptions/InvalidOffsetException';
import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import Collection from '../../../src/Support/Collection';
import UserFactory from '../../mock/Factories/UserFactory';
import type Model from '../../../src/Calliope/Model';

class FakeFactory extends Factory {
    // @ts-expect-error
    scopeAsProperty = 0;

    invalidScope() {
        return null;
    }
}

let factoryBuilder: FactoryBuilder;

describe('factoryBuilder', () => {
    beforeEach(() => {
        factoryBuilder = new FactoryBuilder(User);
    });

    describe('states()', () => {
        const factoryName: string = new User().factory().constructor.name;

        it('can return the model with the states applied', () => {
            const user: User = factoryBuilder.state('withTeam').create() as User;
            expect(user.team).toBeInstanceOf(Team);

            const newUser = factoryBuilder.state('nameOverridden').create() as User;
            expect(newUser.name).not.toBe(user.name);
        });

        it('can take multiple arguments', () => {
            const user: User = factoryBuilder.create() as User;
            const newUser = factoryBuilder.state(['withTeam', 'nameOverridden']).create() as User;

            expect(newUser.team).toBeInstanceOf(Team);
            expect(newUser.name).not.toBe(user.name);
        });

        it('throws error if the given state is not defined', () => {
            const failingFunc = jest.fn(
                () => factoryBuilder.state('undefinedScope').create()
            );

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    '\'undefinedScope\' is not defined on the \'' + factoryName + '\' class.'
                )
            );
        });

        it('throws error if the given state is not a function', () => {
            User.prototype.factory = () => new FakeFactory();

            const failingFunc = jest.fn(
                () => factoryBuilder.state('scopeAsProperty').create()
            );

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    '\'scopeAsProperty\' is not a method on the \'' + String(FakeFactory.name) + '\' class.'
                )
            );
        });

        it('throws error if the given state is not a returning an object', () => {
            User.prototype.factory = () => new FakeFactory();

            const failingFunc = jest.fn(
                () => factoryBuilder.state('invalidScope').create()
            );

            expect(failingFunc).toThrow(
                new TypeError(
                    '\'invalidScope\' is not returning an object on \'' + String(FakeFactory.name) + '\' class.'
                )
            );
        });
    });

    describe('getFactory()', () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const userFactory = User.prototype.factory;

        afterEach(() => {
            User.prototype.factory = userFactory;
        });

        it('throws error if the factory resolved isn\'t an instanceof Factory', () => {
            // @ts-expect-error
            User.prototype.factory = () => ({});

            // @ts-expect-error
            const failingFunc = jest.fn(() => factoryBuilder.getFactory());

            expect(failingFunc).toThrow(
                new TypeError(
                    'Invalid return type defined on the factory() method on the \'' + User.name + '\' class.'
                )
            );
        });

        it('throws error if factory is not defined on the model or isn\'t a function', () => {
            // @ts-expect-error
            User.prototype.factory = 1;

            // @ts-expect-error
            let failingFunc = jest.fn(() => factoryBuilder.getFactory());

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    'The method factory() is either not defined or not and instance of Function on the \''
                    + User.name + '\' class.'
                )
            );

            // @ts-expect-error
            delete User.prototype?.factory;

            // @ts-expect-error
            failingFunc = jest.fn(() => factoryBuilder.getFactory());

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    'The method factory() is either not defined or not and instance of Function on the \''
                    + User.name + '\' class.'
                )
            );
        });
    });

    describe('times()', () => {
        it('can return a collection on amount higher than 1', () => {
            const collection = factoryBuilder.times(2).create();
            expect(collection).toBeInstanceOf(ModelCollection);
            expect(collection).toHaveLength(2);
        });

        it('can return a model when the amount is <= 1 or by default', () => {
            expect(factoryBuilder.times(1).create()).toBeInstanceOf(User);
            expect(factoryBuilder.create()).toBeInstanceOf(User);
        });
    });

    describe('make()', () => {
        it('doesn\'t set the id and timestamps', () => {
            const model = factoryBuilder.make() as User;

            expect(model[model.getUpdatedAtColumn()]).toBeNull();
            expect(model[model.getCreatedAtColumn()]).toBeNull();
            expect(model[model.getDeletedAtColumn()]).toBeNull();
            expect(model.getKey()).toBeUndefined();
        });

        it('can return a model', () => {
            expect(factoryBuilder.make()).toBeInstanceOf(User);
        });

        it('can return a model collection', () => {
            expect(factoryBuilder.times(2).make()).toBeInstanceOf(ModelCollection);
        });
    });

    describe('afterMaking()', () => {
        it('calls the afterCreating with the created model or collection', () => {
            const mockFn = jest.fn();
            const unCalledMockFn = jest.fn();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalFactory = User.prototype.factory;

            class MockUserFactory extends UserFactory {
                afterCreating(modelOrCollection: Model | ModelCollection<Model>) {
                    unCalledMockFn(modelOrCollection);
                }

                afterMaking(modelOrCollection: Model | ModelCollection<Model>) {
                    mockFn(modelOrCollection);
                }
            }
            User.prototype.factory = () => new MockUserFactory();

            factoryBuilder.make();
            expect(mockFn).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith(factoryBuilder.make());
            expect(unCalledMockFn).not.toHaveBeenCalled();

            User.prototype.factory = originalFactory;
        });
    });

    describe('create()', () => {
        it('can create independent models', () => {
            const userOne = factoryBuilder.create() as User;
            const userTwo = factoryBuilder.create() as User;

            expect(userOne).not.toStrictEqual(userTwo);
        });

        it('sets unique ids', () => {
            const userOne = factoryBuilder.create() as User;
            const userTwo = factoryBuilder.create() as User;

            expect(userOne.getKey()).not.toBe(userTwo.getKey());
        });

        it('sets the dates', () => {
            const userOne = factoryBuilder.create() as User;

            expect(userOne.createdAt).not.toBeUndefined();
            expect(userOne.updatedAt).not.toBeUndefined();
            expect(userOne.deletedAt).toBeNull();
        });

        it('doesn\'t set the dates if they\'re disabled', () => {
            factoryBuilder = new FactoryBuilder(Team);

            const team = factoryBuilder.create() as User;

            expect(team.createdAt).toBeUndefined();
            expect(team.updatedAt).toBeUndefined();
            expect(team.deletedAt).toBeUndefined();
        });
    });

    describe('afterCreating()', () => {
        it('calls the afterCreating with the created model or collection', () => {
            const mockFn = jest.fn();
            const unCalledMockFn = jest.fn();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalFactory = User.prototype.factory;

            class MockUserFactory extends UserFactory {
                afterCreating(modelOrCollection: Model | ModelCollection<Model>) {
                    mockFn(modelOrCollection);
                }

                afterMaking(modelOrCollection: Model | ModelCollection<Model>) {
                    unCalledMockFn(modelOrCollection);
                }
            }
            User.prototype.factory = () => new MockUserFactory();

            factoryBuilder.create();
            expect(mockFn).toHaveBeenCalled();
            expect(mockFn).toHaveBeenCalledWith(factoryBuilder.create({ id: 1 }));
            expect(unCalledMockFn).not.toHaveBeenCalled();

            User.prototype.factory = originalFactory;
        });
    });

    describe('raw()', () => {
        it('returns raw attributes', () => {
            expect(factoryBuilder.raw()).toStrictEqual({
                name: 'username 1',
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            });
        });

        it('returns multiple raw attributes', () => {
            expect(factoryBuilder.times(2).raw())
                .toStrictEqual(new Collection([
                    {
                        name: 'username 1',
                        createdAt: null,
                        updatedAt: null,
                        deletedAt: null
                    },
                    {
                        name: 'username 1',
                        createdAt: null,
                        updatedAt: null,
                        deletedAt: null
                    }
                ] as Attributes[]));
        });

        it('merges in states', () => {
            expect(factoryBuilder.state('nameOverridden').raw()).toStrictEqual({
                name: 'overridden name',
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            });
        });

        it('merges in argument', () => {
            expect(factoryBuilder.raw({ createdAt: 'value' })).toStrictEqual({
                name: 'username 1',
                createdAt: 'value',
                updatedAt: null,
                deletedAt: null
            });
        });

        it('resolves methods when merging', () => {
            // the resolving happens in the following order:
            // 1 - definition
            // 2 - states
            // 3 - arguments
            const now = new Date().toISOString();

            expect(factoryBuilder.state('resolvedName')
                .raw({
                    deletedAt: (attributes: Attributes) => {
                        return attributes.deletegdAt ?? now;
                    }
                }))
                .toStrictEqual({
                    name: 'resolved name',
                    createdAt: null,
                    updatedAt: null,
                    deletedAt: now
                });
        });
    });

    describe('getId()', () => {
        it('can return uuid if primaryKey is uuid', () => {
            // @ts-expect-error
            factoryBuilder.model.primaryKey = 'uuid';

            // @ts-expect-error
            expect((factoryBuilder.getKey() as string).isUuid()).toBe(true);

            // @ts-expect-error
            factoryBuilder.model.primaryKey = 'id';
        });

        it('returns unique sequential ids', () => {
            // @ts-expect-error
            const id1 = factoryBuilder.getKey();
            // @ts-expect-error
            const id2 = factoryBuilder.getKey();

            expect(id1).not.toBe(id2);
        });

        it('returns unique sequential ids without interference from other models', () => {
            // @ts-expect-error
            const userId1 = factoryBuilder.getKey();
            // @ts-expect-error
            const userId2 = factoryBuilder.getKey();

            // @ts-expect-error
            const teamId1 = new FactoryBuilder(Team).getKey();
            // @ts-expect-error
            const teamId2 = new FactoryBuilder(Team).getKey();

            expect(teamId1).toBe(userId1);
            expect(teamId2).toBe(userId2);
        });
    });
});
