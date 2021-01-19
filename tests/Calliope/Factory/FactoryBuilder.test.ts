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
import Shift from '../../mock/Models/Shift';
import Contract from '../../mock/Models/Contract';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';

class FakeFactory extends Factory<User> {
    // @ts-expect-error
    scopeAsProperty = 0;

    invalidScope() {
        return null;
    }
}

let factoryBuilder: FactoryBuilder<User>;

describe('factoryBuilder', () => {
    beforeEach(() => {
        factoryBuilder = new FactoryBuilder(User);
    });

    describe('states()', () => {
        const factoryName: string = new User().factory().constructor.name;

        it('should return the model with the states applied', () => {
            const user = factoryBuilder.state('withTeam').create() as User;
            expect(user.team).toBeInstanceOf(Team);

            const newUser = factoryBuilder.state('nameOverridden').create() as User;
            expect(newUser.name).not.toBe(user.name);
        });

        it('should take multiple arguments', () => {
            const user = factoryBuilder.create() as User;
            const newUser = factoryBuilder.state(['withTeam', 'nameOverridden']).create() as User;

            expect(newUser.team).toBeInstanceOf(Team);
            expect(newUser.name).not.toBe(user.name);
        });

        it('should call the states with an empty target model and the current index', () => {
            const user = factoryBuilder.state(['calledWithArguments']).create() as User;

            expect(user.modelAttribute).toBe(User.name);
            expect(user.index).toBe(1);
        });

        it('should throw an error if the given state is not defined', () => {
            const failingFunc = jest.fn(
                () => factoryBuilder.state('undefinedScope').create()
            );

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    '\'undefinedScope\' is not defined on the \'' + factoryName + '\' class.'
                )
            );
        });

        it('should throw an error if the given state is not a function', () => {
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

        it('should throw an error if the given state is not a returning an object', () => {
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

        it('should throw an error if the factory resolved isn\'t an instanceof Factory', () => {
            // @ts-expect-error
            User.prototype.factory = () => ({});

            // @ts-expect-error
            const failingFunc = jest.fn(() => factoryBuilder.getFactory());

            expect(failingFunc).toThrow(
                new TypeError(
                    'Invalid return type defined on the factory() method on the \'' + User.name + '\' class.'
                    + 'Expected \'' + Factory.name + '\', got \'object\'.'
                )
            );
        });

        it('should throw an error if factory is not defined on the model or isn\'t a function', () => {
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
        it('should return a collection on amount higher than 1', () => {
            const collection = factoryBuilder.times(2).create();
            expect(collection).toBeInstanceOf(ModelCollection);
            expect(collection).toHaveLength(2);
        });

        it('should return a model when the amount is <= 1 or by default', () => {
            expect(factoryBuilder.times(1).create()).toBeInstanceOf(User);
            expect(factoryBuilder.create()).toBeInstanceOf(User);
        });
    });

    describe('make()', () => {
        it('should not set the id and timestamps', () => {
            const model = factoryBuilder.make() as User;

            expect(model[model.getUpdatedAtColumn()]).toBeNull();
            expect(model[model.getCreatedAtColumn()]).toBeNull();
            expect(model[model.getDeletedAtColumn()]).toBeNull();
            expect(model.getKey()).toBeUndefined();
        });

        it('should return a model', () => {
            expect(factoryBuilder.make()).toBeInstanceOf(User);
        });

        it('should return a model collection', () => {
            expect(factoryBuilder.times(2).make()).toBeInstanceOf(ModelCollection);
        });
    });

    describe('afterMaking()', () => {
        it('should call the afterCreating with the created model or collection', () => {
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
        it('should create independent models', () => {
            const userOne = factoryBuilder.create() as User;
            const userTwo = factoryBuilder.create() as User;

            expect(userOne).not.toStrictEqual(userTwo);
        });

        it('should set unique ids', () => {
            const userOne = factoryBuilder.create() as User;
            const userTwo = factoryBuilder.create() as User;

            expect(userOne.getKey()).not.toBe(userTwo.getKey());
        });

        it('should set the dates', () => {
            const userOne = factoryBuilder.create() as User;

            expect(userOne.createdAt).not.toBeUndefined();
            expect(userOne.updatedAt).not.toBeUndefined();
            expect(userOne.deletedAt).toBeNull();
        });

        it('should not set the dates if they\'re disabled', () => {
            const factoryBuilder = new FactoryBuilder(Team);

            const team = factoryBuilder.create() as Team;

            expect(team.createdAt).toBeUndefined();
            expect(team.updatedAt).toBeUndefined();
            expect(team.deletedAt).toBeUndefined();
        });
    });

    describe('afterCreating()', () => {
        it('should call the afterCreating with the created model or collection', () => {
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

    describe('with()', () => {
        it('should add the relation data to the result', () => {
            expect((factoryBuilder.with(Contract.factory()).raw() as Attributes).contract).not.toBeUndefined();
            expect((factoryBuilder.with(Contract.factory()).make() as User).contract).toBeInstanceOf(Contract);

            factoryBuilder.with(Shift.factory()).times(2).make().forEach((user: User) => {
                expect(user.shifts).toBeInstanceOf(ModelCollection);
            });
        });

        it('should throw an error if the relation given is not defined', () => {
            const failingFunc = jest.fn(() => factoryBuilder.with(Contract.factory(), 'undefinedRelationship').make());

            expect(failingFunc).toThrow(new InvalidArgumentException(
                '\'' + factoryBuilder.model.getName()
                + '\' doesn\'t have the \'undefinedRelationship\' or \'undefinedRelationships\' relationship defined.'
            ));
        });

        it('should throw an error if the guessed relation is not defined', () => {
            const contractFactoryBuilder = new FactoryBuilder<Contract>(Contract);
            const failingFunc = jest.fn(() => contractFactoryBuilder.with(Shift.factory()).make());

            expect(failingFunc).toThrow(new InvalidArgumentException(
                '\'' + contractFactoryBuilder.model.getName()
                + '\' doesn\'t have the \'shift\' or \'shifts\' relationship defined.'
            ));
        });
    });

    describe('raw()', () => {
        it('should return raw attributes', () => {
            expect(factoryBuilder.raw()).toStrictEqual({
                name: 'username 1',
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            });
        });

        it('should return an empty object if no attributes has been defined or 0 models requested', () => {
            class TestFactory extends Factory<any> {}
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const originalValue = Team.prototype.factory;

            Team.prototype.factory = () => new TestFactory;

            expect(new FactoryBuilder(Team).raw()).toStrictEqual({});
            expect(new FactoryBuilder(Team).times(0).raw()).toStrictEqual({});

            Team.prototype.factory = originalValue;
        });

        it('should return multiple raw attributes', () => {
            expect(factoryBuilder.times(2).raw())
                .toStrictEqual(new Collection([
                    {
                        name: 'username 1',
                        createdAt: null,
                        updatedAt: null,
                        deletedAt: null
                    },
                    {
                        name: 'username 2',
                        createdAt: null,
                        updatedAt: null,
                        deletedAt: null
                    }
                ] as Attributes[]));
        });

        it('should merge in states', () => {
            expect(factoryBuilder.state('nameOverridden').raw()).toStrictEqual({
                name: 'overridden name',
                createdAt: null,
                updatedAt: null,
                deletedAt: null
            });
        });

        it('should merge in argument', () => {
            expect(factoryBuilder.raw({ createdAt: 'value' })).toStrictEqual({
                name: 'username 1',
                createdAt: 'value',
                updatedAt: null,
                deletedAt: null
            });
        });

        it('should resolve methods when merging', () => {
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

        it('should pass the already resolved values to the attribute method', () => {
            // attributes are resolved in order
            /** @see {FactoryBuilder.prototype.resolveAttributes} */

            factoryBuilder.raw({
                a: true,
                [Symbol()]: 1,
                b: (attributes: Attributes) => {
                    // check that this method call receives the resolved attributes
                    // within this attribute resolving iteration as well as the
                    // already resolved attributes
                    expect(attributes).toStrictEqual({
                        a: true,
                        name: 'username 1'
                    });

                    return true;
                },
                c: () => true,
                d: true
            });

            // fyi: checking a mock call kept being updated with the
            // full set of attributes as the object is passed
            // by reference, hence the inline expect
        });
    });

    describe('getId()', () => {
        it('should return uuid if primaryKey is uuid', () => {
            Object.defineProperty(factoryBuilder.model, 'primaryKey', {
                configurable: true,
                get(): string {
                    return 'uuid';
                }
            });

            // @ts-expect-error
            expect((factoryBuilder.getKey() as string).isUuid()).toBe(true);

            Object.defineProperty(factoryBuilder.model, 'primaryKey', {
                get(): string {
                    return 'id';
                }
            });
        });

        it('should return unique sequential ids', () => {
            // @ts-expect-error
            const id1 = factoryBuilder.getKey();
            // @ts-expect-error
            const id2 = factoryBuilder.getKey();

            expect(id1).not.toBe(id2);
        });

        it('should return unique sequential ids without interference from other models', () => {
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
