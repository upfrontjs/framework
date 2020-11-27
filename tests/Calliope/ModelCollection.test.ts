import Collection from '../../src/Support/Collection';
import ModelCollection from '../../src/Calliope/ModelCollection';
import data from '../mock/Models/data';
import User from '../mock/Models/User';

let collection: ModelCollection<User>;
const incompatibleElementsError = ModelCollection.name + ' can only handle Model values.';

describe('modelCollection', () => {
    const elements: [User, User, User] = [new User(data.UserOne), new User(data.UserTwo), new User(data.UserThree)];

    beforeEach(() => {
        collection = new ModelCollection(elements);
    });

    describe('constructor()', () => {
        it('can initialise and empty collection', () => {
            collection = new ModelCollection();
            expect(collection).toBeDefined();
            expect(collection).toHaveLength(0);
            expect(collection).toBeInstanceOf(ModelCollection);
        });

        it('checks the collection\'s integrity after setting the models', () => {
        // @ts-expect-error
            const func = () => new ModelCollection([1]);
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('isModelCollection()', () => {
        it('can assert that it\' a model collection', () => {
            expect(ModelCollection.isModelCollection(elements)).toBe(false);
            expect(ModelCollection.isModelCollection(new Collection(elements))).toBe(false);
            const baseLanguageTypes = [1, 'string', null, undefined, NaN, true, () => {}, {}, []];

            baseLanguageTypes.forEach(type => {
                expect(ModelCollection.isModelCollection(type)).toBe(false);
            });

            expect(ModelCollection.isModelCollection(collection)).toBe(true);
        });
    });

    describe('_getArgumentKeys()', () => {
        beforeEach(() => {
            collection = new ModelCollection();
        });

        it('returns a collection of strings', () => {
        //@ts-expect-error
            expect(collection._getArgumentKeys(new ModelCollection(new User(data.UserOne))))
                .toStrictEqual(new Collection([String(data.UserOne.id)]));
        });

        it('discard non string/number arguments', () => {
        //@ts-expect-error
            expect(collection._getArgumentKeys([null, true, [1]])).toStrictEqual(new Collection('1'));
        });

        it('accepts an array of strings/numbers/Models', () => {
        //@ts-expect-error
            expect(collection._getArgumentKeys([new User(data.UserOne), '2', 3]))
                .toStrictEqual(new Collection(['1', '2', '3']));
        });
    });

    describe('modelKeys()', () => {
        it('returns the correct values', () => {
            expect(collection.modelKeys()).toContain(elements[0].getKey());
        });

        it('returns a collection', () => {
            expect(collection.modelKeys()).toBeInstanceOf(Collection);
        });

        it('can be chained', () => {
            expect(collection.modelKeys().toArray()).toHaveLength(elements.length);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.modelKeys();
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('unique()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User(data.UserOne)];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('can de-duplicate the collection', () => {
            expect(collection.unique()).toHaveLength(2);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.includes(elements[0] as User) && collection.includes(elements[1] as User)).toBe(true);
        });

        it('can de-duplicate the collection by the given key', () => {
            const items = [new User(data.UserOne), new User({ ...data.UserTwo, name: data.UserOne.name })];
            collection = new ModelCollection(items);

            expect(collection.unique('name')).toHaveLength(1);
            expect(collection.first()).toStrictEqual(items[0]);
        });

        it('can de-duplicate the collection by the given function', () => {
            expect(collection.unique(model => model.getName())).toHaveLength(1);
            expect(collection.first()).toStrictEqual(elements[0]);
        });

        it('can de-duplicate the collection by passing a function name that is called on the model', () => {
            expect(collection.unique('getName')).toHaveLength(1);
            expect(collection.first()).toStrictEqual(elements[0]);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.unique();
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.unique().first()).toStrictEqual(elements[0]);
        });
    });

    describe('hasDuplicates()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User(data.UserOne)];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('can check if the collection has duplicates', () => {
            expect(collection.hasDuplicates()).toBe(true);

            elements.pop();
            collection = new ModelCollection(elements);

            expect(collection.hasDuplicates()).toBe(false);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.hasDuplicates();
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('duplicates()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User(data.UserOne)];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('can only keep the duplicates', () => {
            const duplicateOnlyCollection = collection.duplicates();

            expect(duplicateOnlyCollection).toHaveLength(1);
            expect(
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                duplicateOnlyCollection.includes(elements[0] as User)
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                && !duplicateOnlyCollection.includes(elements[1] as User)
            )
                .toBe(true);
        });

        it('can check for duplicates by key', () => {
            const items = [new User(data.UserOne), new User({ ...data.UserTwo, name: data.UserOne.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates('name')).toHaveLength(1);
            expect(collection.first()?.name).toStrictEqual(data.UserOne.name);
        });

        it('can check for duplicates by passing a function name that is called on the model', () => {
            const items = [new User(data.UserOne), new User({ ...data.UserTwo, name: data.UserOne.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates('getName')).toHaveLength(1);
        });

        it('can check for duplicates by calling a method with the model', () => {
            const items = [new User(data.UserOne), new User({ ...data.UserTwo, name: data.UserOne.name })];
            collection = new ModelCollection(items);

            expect(collection.duplicates(model => model.getName())).toHaveLength(1);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.duplicates();
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.duplicates().toArray()).toHaveLength(1);
        });
    });

    describe('delete()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User(data.UserOne)];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('can delete items', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.delete(elements[1] as User)).toHaveLength(2);
            expect(elements[0]?.is(collection.first())).toBe(true);
        });

        it('can delete multiple items', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.delete(elements[0] as User)).toHaveLength(1);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const func = () => collection.delete(collection[1] as User);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.delete(elements[0] as User).toArray()).toHaveLength(1);
        });
    });

    describe('includes()', () => {
    /* eslint-disable jest/prefer-to-contain */
        it('asserts whether the given model is in the collection', () => {
            expect(collection.includes(elements[0])).toBe(true);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.includes(new User(data.UserOne));
            expect(func).toThrow(incompatibleElementsError);
        });
    /* eslint-enable jest/prefer-to-contain */
    });

    describe('diff()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User({ ...data.UserTwo, id: 3 })];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('returns models that are in either not in the arguments or collection', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.diff(elements[0] as User)).toHaveLength(2);
        });

        it('accepts number of arguments', () => {
            const diffCollection = collection.diff(collection.first() as User, collection.last() as User);

            expect(diffCollection).toHaveLength(1);
            expect(diffCollection.first()).toBe(elements[1]);
        });

        it('checks the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.diff();
            expect(func).toThrow(incompatibleElementsError);
        });

        it('checks that the arguments are all models', () => {
            // @ts-expect-error
            const func = () => collection.diff([1]);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.diff(elements[0] as User).nth(1)).toHaveLength(2);
        });
    });

    describe('union()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User({ ...data.UserTwo, id: 3 })];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });
        it('can join two arrays without duplicates', () => {
            expect(collection.union([new User(data.UserTwo), new User({ ...data.UserTwo, id: 4 })])).toHaveLength(
                elements.length + 1
            );
        });

        it('adds the remaining models to the end of the array', () => {
            expect(collection.union([new User(data.UserTwo), new User({ ...data.UserTwo, id: 4 })]).last())
                .toStrictEqual(new User({ ...data.UserTwo, id: 4 }));
        });

        it('can be chained', () => {
            expect(
                collection.union([new User(data.UserTwo), new User({ ...data.UserTwo, id: 4 })]).nth(1)
            ).toHaveLength(elements.length + 1);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.union([new User(data.UserTwo), new User({ ...data.UserTwo, id: 3 })]);
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('only()', () => {
        it('returns only the specified models', () => {
            expect(collection.only(elements[0])).toHaveLength(1);
            expect(collection.first()).toBe(elements[0]);
        });

        it('take arguments in a various format', () => {
            expect(collection.only(elements[1], '1')).toHaveLength(2);
        });

        it('take ids as an argument', () => {
            const filteredCollection = collection.only(elements[0]);

            expect(filteredCollection).toHaveLength(1);
            expect(filteredCollection.first()).toStrictEqual(elements[0]);
        });

        it('checks the collection\'s integrity before the method', () => {
            // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.only(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.only(1).nth(1)).toHaveLength(1);
        });
    });

    describe('except()', () => {
        const elements = [new User(data.UserOne), new User(data.UserTwo), new User({ ...data.UserTwo, id: 3 })];

        beforeEach(() => {
            collection = new ModelCollection(elements);
        });

        it('returns all the models except the specified ones', () => {
            expect(collection.except(elements[0])).toHaveLength(elements.length - 1);
            expect(collection.last()).toBe(elements[elements.length - 1]);
        });

        it('take arguments in a various format', () => {
            expect(collection.except(new Collection([elements[1], '1']))).toHaveLength(1);
        });

        it('take ids as an argument', () => {
            const filteredCollection = collection.except([1, '2']);
            expect(filteredCollection).toHaveLength(1);
            expect(filteredCollection.first()).toBe(elements[elements.length - 1]);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.except(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.except(1).nth(1)).toHaveLength(elements.length - 1);
        });
    });

    describe('push()', () => {
        it('can only push model values', () => {
        // @ts-expect-error
            const failingFunc = () => collection.push(3);
            const passingFunc = () => collection.push(elements[0]);

            expect(failingFunc).toThrow(incompatibleElementsError);
            expect(passingFunc).not.toThrow();
        });

        it('updates length', () => {
            expect(collection).toHaveLength(elements.length);

            collection.push(elements[0]);

            expect(collection).toHaveLength(elements.length + 1);
        });

        it('updates adds value to the end of the collection', () => {
            collection.push(elements[0]);

            expect(collection.last()).toBe(elements[0]);
        });
    });

    describe('findByKey()', () => {
        it('can find the correct model', () => {
            const result = collection.findByKey(data.UserOne.id);
            expect(collection.findByKey(data.UserOne.id)).toBeInstanceOf(User);
            expect(result).toStrictEqual(elements[0]);
        });

        it('returns undefined if nothing found', () => {
            expect(collection.findByKey(10)).toBeUndefined();
        });

        it('returns a collection on multiple hits', () => {
            expect(collection.findByKey([1, 2])).toBeInstanceOf(ModelCollection);
        });

        it('can be chained if has multiple results', () => {
            expect(collection.findByKey([1, 2])?.nth(1)).toHaveLength(elements.length - 1);
        });

        it('can return a default value if on not found', () => {
            expect(collection.findByKey('randomKey', 1)).toBe(1);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.findByKey(1);
            expect(func).toThrow(incompatibleElementsError);
        });
    });

    describe('pluck()', () => {
        it('returns a Collection', () => {
            expect(collection.pluck('name')).toBeInstanceOf(Collection);
            expect(collection.pluck('name')).not.toBeInstanceOf(ModelCollection);
        });

        it('can return an array of values for a single key', () => {
            expect(collection.pluck('name').toArray())
                .toStrictEqual([data.UserOne.name, data.UserTwo.name, data.UserThree.name]);
        });

        it('can return an array of object on multiple keys', () => {
            expect(collection.pluck(['name', 'id']).first())
                .toStrictEqual({ id: data.UserOne.id, name: data.UserOne.name });
        });

        it('can take arguments in multiple formats', () => {
            expect(collection.pluck('name')).toHaveLength(elements.length);
            expect(collection.pluck(['name', 'id'])).toHaveLength(elements.length);
        });
    });

    describe('chunk()', () => {
        it('returns a Collection', () => {
            expect(Collection.isCollection(collection.chunk(1))).toBe(true);
            expect(ModelCollection.isModelCollection(collection.chunk(1))).toBe(false);
        });

        it('can chunk the collection into collections', () => {
            expect(collection.chunk(elements.length)).toHaveLength(1);
            expect(collection.chunk(1).first()).toBeInstanceOf(ModelCollection);
            expect(collection.chunk(1)).toHaveLength(elements.length);
        });

        it('can be chained', () => {
            expect(collection.chunk(elements.length).toArray()).toHaveLength(1);
        });
    });

    describe('intersect()', () => {
        it('gets the intersection of the collection and the arguments', () => {
            const intersectedCollection = collection.intersect(elements[0]);
            expect(intersectedCollection).toHaveLength(1);
            expect(intersectedCollection).not.toContain(elements[1]);
        });

        it('checks the collection\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            const func = () => collection.intersect(elements[0]);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('checks the argument\'s integrity before the method', () => {
        // @ts-expect-error
            collection[0] = 1;
            // @ts-expect-error
            const func = () => collection.intersect(1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.intersect(elements[0]).toArray()).toHaveLength(1);
        });
    });

    describe('pad()', () => {
        it('returns a collection', () => {
            expect(ModelCollection.times(5, () => new User(data.UserOne))).toBeInstanceOf(ModelCollection);
        });

        it('can pad the collection', () => {
            expect(collection.pad(-5, elements[1]).first()?.getKey()).toBe(elements[1].getKey());
        });

        it('checks the argument\'s integrity before the method', () => {
        // @ts-expect-error
            const func = () => collection.pad(4, 1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(collection.pad(7, elements[1]).toArray()).toHaveLength(7);
        });
    });

    describe('times()', () => {
        it('returns a collection', () => {
            expect(ModelCollection.times(5, () => new User(data.UserOne))).toBeInstanceOf(ModelCollection);
        });

        it('checks the collection\'s integrity before constructing', () => {
            const func = () => ModelCollection.times(3, 1);
            expect(func).toThrow(incompatibleElementsError);
        });

        it('can be chained', () => {
            expect(ModelCollection.times(5, () => new User(data.UserOne)).toArray()).toHaveLength(5);
        });
    });
});
