import FactoryBuilder from '../../../src/Calliope/Factory/FactoryBuilder';
import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import ModelCollection from '../../../src/Calliope/ModelCollection';
import InvalidOffsetException from '../../../src/Exceptions/InvalidOffsetException';
import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import Collection from '../../../src/Support/Collection';
import UserFactory from '../../mock/Factories/UserFactory';
import Model from '../../../src/Calliope/Model';
import Shift from '../../mock/Models/Shift';
import Contract from '../../mock/Models/Contract';
import InvalidArgumentException from '../../../src/Exceptions/InvalidArgumentException';
import { now } from '../../setupTests';

let factoryBuilder: FactoryBuilder<User, UserFactory>;

describe('FactoryBuilder', () => {
    beforeEach(() => {
        factoryBuilder = new FactoryBuilder(User);
    });

    describe('state()', () => {
        const factoryName: string = new User().factory().constructor.name;

        it('should return the model with the states applied', () => {
            const user = factoryBuilder.state('withTeam').createOne();
            expect(user.team).toBeInstanceOf(Team);

            const newUser = factoryBuilder.state('nameOverridden').createOne();
            expect(newUser.name).not.toBe(user.name);
        });

        it('should take multiple arguments', () => {
            const user = factoryBuilder.createOne();
            const newUser = factoryBuilder.state(['withTeam', 'nameOverridden']).createOne();

            expect(newUser.team).toBeInstanceOf(Team);
            expect(newUser.name).not.toBe(user.name);
        });

        it('should call the states with an empty target model and the current index', () => {
            const user = factoryBuilder.state(['calledWithArguments']).createOne();

            expect(user.modelAttribute).toBe(User.name);
            expect(user.index).toBe(1);
        });

        it('should throw an error if the given state is not defined', () => {
            const failingFunc = jest.fn(
                () => factoryBuilder.state('undefinedScope').create()
            );

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    '\'undefinedScope\' is not defined on the \'' + factoryName + '\' factory class.'
                )
            );
        });

        it('should throw an error if the given state is not a function', () => {
            class FakeFactory extends Factory<User> {
                // @ts-expect-error
                public scopeAsProperty = 0;
            }

            // @ts-expect-error
            User.prototype.factory = () => new FakeFactory();

            const failingFunc = jest.fn(
                () => factoryBuilder.state('scopeAsProperty').create()
            );

            expect(failingFunc).toThrow(
                new InvalidOffsetException(
                    '\'scopeAsProperty\' is not a method on the \'' + String(FakeFactory.name) + '\' factory class.'
                )
            );
        });

        it('should throw an error if the given state is not a returning an object', () => {
            class FakeFactory extends Factory<User> {
                public invalidScope() {
                    return null;
                }
            }

            // @ts-expect-error
            User.prototype.factory = () => new FakeFactory();

            const failingFunc = jest.fn(
                () => factoryBuilder.state('invalidScope').create()
            );

            expect(failingFunc).toThrow(
                new TypeError(
                    '\'invalidScope\' is not returning an object on \'' + String(FakeFactory.name) + '\' factory class.'
                )
            );
        });

        it('should not call a state twice', () => {
            const func = jest.fn();
            class LocalFakeFactory extends Factory<User> {
                public myState() {
                    func();
                    return {};
                }
            }

            // @ts-expect-error
            User.prototype.factory = () => new LocalFakeFactory();
            factoryBuilder.state(['myState', 'myState']).create();

            expect(func).toHaveBeenCalledTimes(1);
        });

        it('should call the states in order they appear in the argument', () => {
            const func = jest.fn();
            class LocalFakeFactory extends Factory<User> {
                public firstState() {
                    func('first name overwrite');
                    return {
                        name: 'first name overwrite'
                    };
                }

                public secondState() {
                    func('second name overwrite');
                    return {
                        name: 'second name overwrite'
                    };
                }
            }

            // @ts-expect-error
            User.prototype.factory = () => new LocalFakeFactory();
            const user = factoryBuilder.state(['firstState', 'secondState']).createOne();

            expect(user.name).toBe('second name overwrite');
            expect(func).toHaveBeenCalledTimes(2);
            expect(func).toHaveBeenNthCalledWith(1, 'first name overwrite');
            expect(func).toHaveBeenNthCalledWith(2, 'second name overwrite');
        });
    });

    describe('getFactory()', () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method
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
                    + ' Expected \'' + Factory.name + '\', got \'object\'.'
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

        it('should throw an error with argument value less than 1', () => {
            expect(() => factoryBuilder.times(0)).toThrow(
                new InvalidArgumentException('\'amount\' expected to be higher than 0.')
            );
            expect(() => factoryBuilder.times(-1)).toThrow(
                new InvalidArgumentException('\'amount\' expected to be higher than 0.')
            );
        });

        it('should round the argument to integers', () => {
            expect(factoryBuilder.times(1.4).create()).toBeInstanceOf(User);
            expect(factoryBuilder.times(1.5).create()).toBeInstanceOf(ModelCollection);
        });

        it('should return an empty object in raw creation when times is less then 1', () => {
            // this is not expected to happen given the error in the times method
            // but by overriding user might end up here
            // @ts-expect-error
            factoryBuilder.amount = 0;
            expect(factoryBuilder.raw()).toStrictEqual({});
        });
    });

    describe('make()', () => {
        it('should not set the id and timestamps', () => {
            const model = factoryBuilder.make() as User;

            expect(model[model.getUpdatedAtName()]).toBeNull();
            expect(model[model.getCreatedAtName()]).toBeNull();
            expect(model[model.getDeletedAtName()]).toBeNull();
            expect(model.getKey()).toBeUndefined();
        });

        it('should return a model', () => {
            expect(factoryBuilder.make()).toBeInstanceOf(User);
        });

        it('should return a model collection', () => {
            expect(factoryBuilder.times(2).make()).toBeInstanceOf(ModelCollection);
        });

        it('should return a related model if the raw attributes given for the relation', () => {
            const team = Team.factory().create() as Team;
            expect(
                (factoryBuilder.make({
                    teamId: team.getKey(),
                    team: team.getRawAttributes()
                }) as User).team
            ).toBeInstanceOf(Team);
        });
    });

    describe('makeOne', () => {
        it('should only ever return one model', () => {
            expect(factoryBuilder.times(2).makeOne()).toBeInstanceOf(User);
        });

        it('should not set the id and timestamps', () => {
            const model = factoryBuilder.makeOne()!;

            expect(model[model.getUpdatedAtName()]).toBeNull();
            expect(model[model.getCreatedAtName()]).toBeNull();
            expect(model[model.getDeletedAtName()]).toBeNull();
            expect(model.getKey()).toBeUndefined();
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.makeOne({ my: 'data' }).my).toBe('data');
        });
    });

    describe('makeMany', () => {
        it('should only ever return a ModelCollection', () => {
            let models = factoryBuilder.makeMany();
            expect(models).toBeInstanceOf(ModelCollection);
            expect(models).toHaveLength(1);

            models = factoryBuilder.times(2).makeMany();
            expect(models).toHaveLength(2);
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.makeMany({ my: 'data' }).every(model => model.my === 'data')).toBe(true);
        });
    });

    describe('afterMaking()', () => {
        it('should call the afterCreating with the created model or collection', () => {
            const mockFn = jest.fn();
            const unCalledMockFn = jest.fn();
            // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method
            const originalFactory = User.prototype.factory;

            class MockUserFactory extends UserFactory {
                public afterCreating(modelOrCollection: Model | ModelCollection<Model>) {
                    unCalledMockFn(modelOrCollection);
                }

                public afterMaking(modelOrCollection: Model | ModelCollection<Model>) {
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
            const userOne = factoryBuilder.createOne();
            const userTwo = factoryBuilder.createOne();

            expect(userOne.getKey()).not.toBe(userTwo.getKey());
        });

        it('should set the ids respective of the model\'s key type', () => {
            // default is number
            expect(typeof factoryBuilder.createOne().getKey()).toBe('number');

            Object.defineProperty(User.prototype, 'keyType', {
                get: () => 'string',
                configurable: true
            });

            expect(typeof factoryBuilder.createOne().getKey()).toBe('string');

            Object.defineProperty(User.prototype, 'keyType', {
                get: () => 'number'
            });
        });

        it('should set the dates', () => {
            const userOne = factoryBuilder.create() as User;

            expect(userOne.createdAt).toBeDefined();
            expect(userOne.updatedAt).toBeDefined();
            expect(userOne.deletedAt).toBeNull();
        });

        it('should not set the dates if they\'re disabled', () => {
            const teamFactoryBuilder = new FactoryBuilder(Team);
            const team = teamFactoryBuilder.create() as Team;

            expect(team.createdAt).toBeUndefined();
            expect(team.updatedAt).toBeUndefined();
            expect(team.deletedAt).toBeUndefined();
        });

        it('should set the last synced at value', () => {
            const teamFactoryBuilder = new FactoryBuilder(Team);
            const team = teamFactoryBuilder.create() as Team;

            expect(team._lastSyncedAt).toBeDefined();
        });
    });

    describe('createOne', () => {
        it('should only ever return one model', () => {
            expect(factoryBuilder.times(2).createOne()).toBeInstanceOf(User);
        });

        it('should set the id and timestamps', () => {
            const model = factoryBuilder.createOne();

            expect(model[model.getUpdatedAtName()]).not.toBeNull();
            expect(model[model.getCreatedAtName()]).not.toBeNull();
            expect(model.getKey()).toBeDefined();
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.createOne({ my: 'data' }).my).toBe('data');
        });
    });

    describe('createMany', () => {
        it('should only ever return a ModelCollection', () => {
            let models = factoryBuilder.createMany();
            expect(models).toBeInstanceOf(ModelCollection);
            expect(models).toHaveLength(1);

            models = factoryBuilder.times(2).createMany();
            expect(models).toHaveLength(2);
        });

        it('should set the id and timestamps', () => {
            const models = factoryBuilder.createMany();

            expect(models.every(model => {
                return model.getKey() && model[model.getUpdatedAtName()] && model[model.getCreatedAtName()];
            })).toBe(true);
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.createMany({ my: 'data' }).every(model => model.my === 'data')).toBe(true);
        });
    });

    describe('afterCreating()', () => {
        it('should call the afterCreating with the created model or collection', () => {
            const mockFn = jest.fn();
            const unCalledMockFn = jest.fn();
            // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method
            const originalFactory = User.prototype.factory;

            class MockUserFactory extends UserFactory {
                public afterCreating(modelOrCollection: Model | ModelCollection<Model>) {
                    mockFn(modelOrCollection);
                }

                public afterMaking(modelOrCollection: Model | ModelCollection<Model>) {
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
            expect(factoryBuilder.with(Contract.factory()).rawOne().contract).toBeDefined();
            expect(factoryBuilder.with(Contract.factory()).makeOne().contract).toBeInstanceOf(Contract);

            factoryBuilder.with(Shift.factory()).times(2).makeMany().forEach((user: User) => {
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

        it('should accept a model constructor as the first argument', () => {
            expect(factoryBuilder.with(Contract).rawOne().contract).toBeDefined();
            expect(factoryBuilder.with(Contract).makeOne().contract).toBeInstanceOf(Contract);

            factoryBuilder.with(Shift).times(2).makeMany().forEach((user: User) => {
                expect(user.shifts).toBeInstanceOf(ModelCollection);
            });
        });

        it('should throw an error if the first argument is not a FactoryBuilder nor a Model constructor', () => {
            const contractFactoryBuilder = new FactoryBuilder<Contract>(Contract);
            // @ts-expect-error
            const failingFunc = jest.fn(() => contractFactoryBuilder.with(new Shift).make());

            expect(failingFunc).toThrow(new InvalidArgumentException(
                'Argument for the \'with\' method expected to be an instance of '
                + FactoryBuilder.name + ' or a ' + 'Model constructor.'
            ));
        });

        it('should throw an error if it\'s a singular relation but the amount on the given factory is multiple', () => {
            const failingCreateFunc = jest.fn(() => factoryBuilder.with(Contract.factory().times(2)).create());

            expect(failingCreateFunc).toThrow(new InvalidArgumentException(
                '\'contract\' is a singular relation, received type: \'' + ModelCollection.name + '\'.'
            ));

            const failingRawFunc = jest.fn(() => factoryBuilder.with(Contract.factory().times(2)).raw());

            expect(failingRawFunc).toThrow(new InvalidArgumentException(
                '\'contract\' is a singular relation, received type: \'' + Collection.name + '\'.'
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

        it('should return an empty object if no attributes has been defined', () => {
            class TestFactory extends Factory<any> {}

            // eslint-disable-next-line @typescript-eslint/unbound-method,jest/unbound-method
            const originalValue = Team.prototype.factory;

            // @ts-expect-error
            Team.prototype.factory = () => new TestFactory;

            expect(new FactoryBuilder(Team).raw()).toStrictEqual({});

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
            expect(factoryBuilder.state('resolvedName')
                .raw({
                    deletedAt: (attributes: Attributes) => {
                        return attributes.deletedAt ?? now;
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

    describe('rawOne', () => {
        it('should only ever return one model', () => {
            expect(factoryBuilder.times(2).rawOne()).toStrictEqual({
                createdAt: null,
                updatedAt: null,
                deletedAt: null,
                name: 'username 1'
            });
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.rawOne({ my: 'data' }).my).toBe('data');
        });
    });

    describe('rawMany', () => {
        it('should only ever return a ModelCollection', () => {
            let attributes = factoryBuilder.rawMany();
            expect(attributes).toBeInstanceOf(Collection);
            expect(attributes).toHaveLength(1);

            attributes = factoryBuilder.times(2).rawMany();
            expect(attributes).toHaveLength(2);
        });

        it('should accept the attributes argument', () => {
            expect(factoryBuilder.rawMany({ my: 'data' }).every(model => model.my === 'data')).toBe(true);
        });
    });

    describe('getId()', () => {
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

    describe('addRelations()', () => {
        it('should return a ModelCollection on make/create', () => {
            expect(factoryBuilder.with(Shift.factory()).times(2).make()).toBeInstanceOf(ModelCollection);
            expect(factoryBuilder.with(Shift.factory()).times(2).create()).toBeInstanceOf(ModelCollection);
        });

        it('should return a Model on make/create of one model', () => {
            expect(factoryBuilder.with(Shift.factory()).make()).toBeInstanceOf(Model);
            expect(factoryBuilder.with(Shift.factory()).create()).toBeInstanceOf(Model);
        });
    });
});

