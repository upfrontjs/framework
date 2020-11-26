import FactoryBuilder from '../../../src/Eloquent/Factory/FactoryBuilder';
import User from '../../mock/Models/User';
import Team from '../../mock/Models/Team';
import Model from '../../../src/Eloquent/Model';
import type { Attributes } from '../../../src/Eloquent/Concerns/HasAttributes';
import ModelCollection from '../../../src/Eloquent/ModelCollection';

class FactoryBuilderTester extends FactoryBuilder {
    public model: Model;
    constructor(modelConstructor: new (attributes?: Attributes) => Model) {
        super(modelConstructor);
        this.model = new modelConstructor;
    }
}

let factoryBuilder: FactoryBuilderTester;

describe('factoryBuilder', () => {
    beforeEach(() => {
        factoryBuilder = new FactoryBuilderTester(User);
    });

    describe('states()', () => {
        it('can return the model with the states applied', () => {
            const user: User = factoryBuilder.state('withTeam').create() as User;
            expect(user.team).toBeInstanceOf(Team);

            const newUser = factoryBuilder.state('nameOverridden').create() as User;
            expect(newUser.name).not.toBe(user.name);
        });

        it('can take multiple arguments', () => {
            const user: User = factoryBuilder.state('withTeam').create() as User;
            expect(user.team).toBeInstanceOf(Team);

            const newUser = factoryBuilder.state('nameOverridden').create() as User;
            expect(newUser.name).not.toBe(user.name);
        });
    });

    describe('times()', () => {
        it('can return a collection on amount higher than 1', () => {
            const collection = factoryBuilder.times(2).create();
            expect(collection).toBeInstanceOf(ModelCollection);
            expect(collection).toHaveLength(2);
        });

        it('can return a model when the amount is <= 1 or by default', () => {
            expect(factoryBuilder.times(1).create()).toBeInstanceOf(Model);
            expect(factoryBuilder.create()).toBeInstanceOf(Model);
        });
    });

    describe('make()', () => {

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
            factoryBuilder = new FactoryBuilderTester(Team);

            const team = factoryBuilder.create() as User;

            expect(team.createdAt).toBeUndefined();
            expect(team.updatedAt).toBeUndefined();
            expect(team.deletedAt).toBeUndefined();
        });
    });

    describe('raw()', () => {

    });

    describe('getFactory()', () => {

    });

    describe('getId()', () => {

    });
});
