import Collection from '../../src/Support/Collection';
import ModelCollection from '../../src/Calliope/ModelCollection';
import User from '../mock/Models/User';
import { types } from '../test-helpers';

let collection: ModelCollection<User>;
const incompatibleElementsError = new TypeError('ModelCollection can only handle Model values.');

const user1 = User.factory().createOne();
const user2 = User.factory().createOne();
const user3 = User.factory().createOne();

describe('ModelCollection', () => {
    const elements = [user1, user2, user3];

    beforeEach(() => {
        collection = new ModelCollection(elements);
    });

    describe('constructor()', () => {
        it('should initialise and empty collection', () => {
            collection = new ModelCollection();
            expect(collection).toBeDefined();
            expect(collection).toHaveLength(0);
            expect(collection).toBeInstanceOf(ModelCollection);
        });

        it('should check the collection\'s integrity after setting the models', () => {
            // @ts-expect-error
            const func = () => new ModelCollection([1]);
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('isModelCollection()', () => {
        it('should assert that it\' a model collection', () => {
            expect(ModelCollection.isModelCollection(elements)).toBe(false);
            expect(ModelCollection.isModelCollection(new Collection(elements))).toBe(false);

            types.forEach(type => {
                expect(ModelCollection.isModelCollection(type)).toBe(false);
            });

            expect(ModelCollection.isModelCollection(collection)).toBe(true);
        });
    });

    describe('_throwIfNotModels()', () => {
        it('should accept a collection of models', () => {
            // @ts-expect-error
            expect(collection._throwIfNotModels(new Collection([user1, user2, user3]))).toBeUndefined();
        });
    });

    describe('_isModelArray()', () => {
        it('should return false if not an array given', () => {
            // @ts-expect-error
            expect(ModelCollection._isModelArray('not array')).toBe(false);
        });
    });

    describe('_getArgumentKeys()', () => {
        beforeEach(() => {
            collection = new ModelCollection();
        });

        it('should return a collection of strings', () => {
            //@ts-expect-error
            expect(collection._getArgumentKeys(new ModelCollection(user1)))
                .toStrictEqual(new Collection([String(user1.getKey())]));
        });

        it('should discard non string/number arguments', () => {
            //@ts-expect-error
            expect(collection._getArgumentKeys([null, true, [1]])).toStrictEqual(new Collection('1'));
        });

        it('should accept an array of strings/numbers/Models', () => {
            //@ts-expect-error
            expect(collection._getArgumentKeys([user1, '2', 3]))
                .toStrictEqual(new Collection(['1', '2', '3']));
        });
    });

    describe('modelKeys()', () => {
        it('should return the correct values', () => {
            expect(collection.modelKeys()).toContain(user1.getKey());
        });

        it('should return a collection', () => {
            expect(collection.modelKeys()).toBeInstanceOf(Collection);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.modelKeys().toArray()).toHaveLength(elements.length);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.modelKeys();
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('unique()', () => {
        const users = [user1, user2, user1];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should de-duplicate the collection', () => {
            expect(collection.unique()).toHaveLength(2);
            // eslint-disable-next-line jest/no-conditional-in-test
            expect(collection.includes(user1) && collection.includes(user2)).toBe(true);
        });

        it('should de-duplicate the collection by the given key', () => {
            const items = [user1, User.make({ ...user1.getRawOriginal(), name: user1.name })];
            collection = new ModelCollection(items);

            expect(collection.unique('name')).toHaveLength(1);
            expect(collection.first()).toStrictEqual(items[0]);
        });

        it('should de-duplicate the collection by the given function', () => {
            expect(collection.unique(model => model.getName())).toHaveLength(1);
            expect(collection.first()).toStrictEqual(user1);
        });

        it('should de-duplicate the collection by passing a function name that is called on the model', () => {
            expect(collection.unique('getName')).toHaveLength(1);
            expect(collection.first()).toStrictEqual(user1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.unique();
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.unique().first()).toStrictEqual(user1);
        });
    });

    describe('hasDuplicates()', () => {
        const users = [user1, user2, user1];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should check if the collection has duplicates', () => {
            expect(collection.hasDuplicates()).toBe(true);

            expect(collection.hasDuplicates(user => user.getKey())).toBe(true);
            expect(collection.hasDuplicates('id')).toBe(true);

            users.pop();
            collection = new ModelCollection(users);

            expect(collection.hasDuplicates()).toBe(false);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.hasDuplicates();
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('duplicates()', () => {
        const users = [user1, user2, user1];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should only keep the duplicates', () => {
            const duplicateOnlyCollection = collection.duplicates();

            expect(duplicateOnlyCollection).toHaveLength(1);
            expect(
                // eslint-disable-next-line jest/no-conditional-in-test
                duplicateOnlyCollection.includes(user1)
                && !duplicateOnlyCollection.includes(user2)
            )
                .toBe(true);
        });

        it('should check for duplicates by key', () => {
            const items = [user1, User.make({ ...user2.getRawOriginal(), name: user1.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates('name')).toHaveLength(1);
            expect(collection.first()?.name).toStrictEqual(user1.name);
        });

        it('should check for duplicates by passing a function name that is called on the model', () => {
            const items = [user1, User.make({ ...user2.getRawOriginal(), name: user1.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates('getName')).toHaveLength(1);
        });

        it('should check for duplicates by calling a method with the model', () => {
            const items = [user1, User.make({ ...user2.getRawOriginal(), name: user1.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates(model => model.getName())).toHaveLength(1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.duplicates();
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.duplicates().toArray()).toHaveLength(1);
        });
    });

    describe('delete()', () => {
        const users = [user1, user2, user1];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should delete items', () => {
            expect(collection.delete(user2)).toHaveLength(2);
            expect(user1?.is(collection.first())).toBe(true);
        });

        it('should delete multiple items', () => {
            expect(collection.delete(user1)).toHaveLength(1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.delete(user2);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.delete(user1).toArray()).toHaveLength(1);
        });
    });

    describe('includes()', () => {
        /* eslint-disable jest/prefer-to-contain */
        it('should assert whether the given model is in the collection', () => {
            expect(collection.includes(user1)).toBe(true);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.includes(user1);
            expect(func).toThrow(incompatibleElementsError);
        });
        /* eslint-enable jest/prefer-to-contain */
    });

    describe('diff()', () => {
        const users = [user1, user2, User.make({ ...user2.getRawOriginal(), id: user3.getKey() })];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should return models that are in either not in the arguments or collection', () => {
            expect(collection.diff(user1)).toHaveLength(2);
        });

        it('should accept an array of arguments', () => {
            const diffCollection = collection.diff([user1, user3]);

            expect(diffCollection).toHaveLength(1);
            expect(diffCollection.first()).toBe(user2);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.diff(user1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should check that the arguments are all models', () => {
            // @ts-expect-error
            const func = () => collection.diff([1]);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.diff(user1).nth(1)).toHaveLength(2);
        });
    });

    describe('union()', () => {
        const users = [user1, user2, User.make({ ...user2.getRawOriginal(), id: 3 })];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });
        it('should join two arrays without duplicates', () => {
            expect(collection.union([user2, User.make({ ...user2.getRawOriginal(), id: 4 })])).toHaveLength(
                users.length + 1
            );
        });

        it('should add the remaining models to the end of the array', () => {
            expect(collection.union([user2, User.make({ ...user2.getRawOriginal(), id: 4 })]).last())
                .toStrictEqual(User.make({ ...user2.getRawOriginal(), id: 4 }));
        });

        it('should return a model collection ready for chaining', () => {
            expect(
                collection.union([user2, User.make({ ...user2.getRawOriginal(), id: 4 })]).nth(1)
            ).toHaveLength(users.length + 1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.union(
                [user2, User.make({ ...user2.getRawOriginal(), id: user3.getKey() })]
            );
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('only()', () => {
        it('should return only the specified models', () => {
            expect(collection.only(user1)).toHaveLength(1);
            expect(collection.first()).toBe(user1);
        });

        it('should take arguments in an array format', () => {
            expect(collection.only([user2, '1'])).toHaveLength(2);
        });

        it('should take ids as an argument', () => {
            const filteredCollection = collection.only(user1);

            expect(filteredCollection).toHaveLength(1);
            expect(filteredCollection.first()).toStrictEqual(user1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.only(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.only(1).nth(1)).toHaveLength(1);
        });
    });

    describe('except()', () => {
        const users = [user1, user2, User.make({ ...user2.getRawOriginal(), id: user3.getKey() })];

        beforeEach(() => {
            collection = new ModelCollection(users);
        });

        it('should return all the models except the specified ones', () => {
            expect(collection.except(user1)).toHaveLength(users.length - 1);
            expect(collection.last()).toBe(users[users.length - 1]);
        });

        it('should take arguments in a various format', () => {
            expect(collection.except(new Collection([user2, '1']))).toHaveLength(1);
        });

        it('should take ids as an argument', () => {
            const filteredCollection = collection.except([1, '2']);
            expect(filteredCollection).toHaveLength(1);
            expect(filteredCollection.first()).toBe(users[users.length - 1]);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.except(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.except(1).nth(1)).toHaveLength(elements.length - 1);
        });
    });

    describe('push()', () => {
        it('should only push model values', () => {
            // @ts-expect-error
            const failingFunc = () => collection.push(3);
            const passingFunc = () => collection.push(user1);

            expect(failingFunc).toThrow(incompatibleElementsError);
            expect(passingFunc).not.toThrow();
        });

        it('should update length', () => {
            expect(collection).toHaveLength(elements.length);

            collection.push(user1);

            expect(collection).toHaveLength(elements.length + 1);
        });

        it('should update adds value to the end of the collection', () => {
            collection.push(user1);

            expect(collection.last()).toBe(user1);
        });
    });

    describe('findByKey()', () => {
        it('should find the correct model', () => {
            const result = collection.findByKey(String(user1.getKey()));
            expect(collection.findByKey(String(user1.getKey()))).toBeInstanceOf(User);
            expect(result).toStrictEqual(user1);
        });

        it('should return undefined if nothing found', () => {
            expect(collection.findByKey(10)).toBeUndefined();
        });

        it('should return a collection on multiple hits', () => {
            expect(collection.findByKey([1, 2])).toBeInstanceOf(ModelCollection);
        });

        it('should return a model collection ready for chaining if has multiple results', () => {
            expect(collection.findByKey([1, 2])?.nth(1)).toHaveLength(elements.length - 1);
        });

        it('should return a default value if on not found', () => {
            expect(collection.findByKey('randomKey', user1)).toStrictEqual(user1);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.findByKey(1);
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('pluck()', () => {
        it('should return a Collection', () => {
            expect(collection.pluck('name')).toBeInstanceOf(Collection);
            expect(collection.pluck('name')).not.toBeInstanceOf(ModelCollection);
        });

        it('should return an array of values for a single key', () => {
            expect(collection.pluck('name').toArray())
                .toStrictEqual([user1.name, user2.name, user3.name]);
        });

        it('should return an array of object on multiple keys', () => {
            expect(collection.pluck(['name', 'id']).first())
                .toStrictEqual({ id: user1.id, name: user1.name });
        });

        it('should take arguments in multiple formats', () => {
            expect(collection.pluck('name')).toHaveLength(elements.length);
            expect(collection.pluck(['name', 'id'])).toHaveLength(elements.length);
        });
    });

    describe('chunk()', () => {
        it('should return a Collection', () => {
            expect(Collection.isCollection(collection.chunk(1))).toBe(true);
            expect(ModelCollection.isModelCollection(collection.chunk(1))).toBe(false);
        });

        it('should chunk the collection into collections', () => {
            expect(collection.chunk(elements.length)).toHaveLength(1);
            expect(collection.chunk(1).first()).toBeInstanceOf(ModelCollection);
            expect(collection.chunk(1)).toHaveLength(elements.length);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.chunk(elements.length).toArray()).toHaveLength(1);
        });
    });

    describe('intersect()', () => {
        it('should get the intersection of the collection and the arguments', () => {
            const intersectedCollection = collection.intersect(user1);
            expect(intersectedCollection).toHaveLength(1);
            expect(intersectedCollection).not.toContain(user2);
        });

        it('should check the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.intersect(user1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should check the argument\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            // @ts-expect-error
            const func = () => collection.intersect(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.intersect(user1).toArray()).toHaveLength(1);
        });
    });

    describe('pad()', () => {
        it('should return a collection', () => {
            expect(ModelCollection.times(5, user1)).toBeInstanceOf(ModelCollection);
        });

        it('should pad the collection', () => {
            expect(collection.pad(-5, user2).first()?.getKey()).toBe(user2.getKey());
        });

        it('should check the argument\'s integrity before the method', () => {
            // @ts-expect-error
            const func = () => collection.pad(4, 1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(collection.pad(7, user2).toArray()).toHaveLength(7);
        });
    });

    describe('times()', () => {
        it('should return a collection', () => {
            expect(ModelCollection.times(5, user1)).toBeInstanceOf(ModelCollection);
        });

        it('should check the collection\'s integrity before constructing', () => {
            const func = () => ModelCollection.times(3, 1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('should return a model collection ready for chaining', () => {
            expect(ModelCollection.times(5, () => user1).toArray()).toHaveLength(5);
        });
    });

    describe('toJSON', () => {
        it('should return a json representation of all the models in the collection', () => {
            const json = collection.toJSON().elements;

            expect(json).toHaveLength(collection.length);
            expect(json[0]![user1.getKeyName()]).toBe(user1.getKey());
        });
    });

    describe('array-methods', () => {
        describe('map()', () => {
            it('should return a collection if not every item returned is model', () => {
                expect(collection.map(user => user.getKey())).toBeInstanceOf(Collection);
                expect(collection.map(user => user.getKey())).not.toBeInstanceOf(ModelCollection);
            });

            it('should return a model collection if every item is still a model', () => {
                expect(collection.map(user => user)).toBeInstanceOf(ModelCollection);
            });
        });
    });

    describe('toString()', () => {
        it('should call the toString method on its members', () => {
            expect(collection.toString()).toBe(elements.map(model => model.toString()).join());
        });
    });
});
