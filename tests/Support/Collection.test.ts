import Collection from '../../src/Support/Collection';

let collection: Collection<any>;

describe('collection', () => {
    describe('construct()', () => {
        it('can be instantiated with array', () => {
            expect(new Collection([1, 2])).toBeInstanceOf(Collection);
        });

        it('should be instantiated with an item', () => {
            expect(new Collection('item')).toBeInstanceOf(Collection);
        });

        it('should have a length value', () => {
            expect(new Collection([1, 2]).length).toBeTruthy();
        });

        it('can be indexed by numbers', () => {
            expect(new Collection([1, 2])[0]).toStrictEqual(1);
        });

        it('can be instantiated without arguments', () => {
            expect(new Collection()).toBeInstanceOf(Collection);
        });
    });

    describe('_allAreObjects()', () => {
        it('should determine if all ar object or not', () => {
            let collection = new Collection([{}, '']);
            // @ts-expect-error
            expect(collection._allAreObjects()).toBe(false);

            collection = new Collection([{}, { test: '' }]);
            // @ts-expect-error
            expect(collection._allAreObjects()).toBe(true);
        });

        it('should assert that all are object not including null', () => {
            const collection = new Collection([{}, null]);
            // @ts-expect-error
            expect(collection._allAreObjects()).toBe(false);
        });
    });

    describe('first()', () => {
        const elements = [1, 2, 3, 4, 5];
        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should get the first item', () => {
            expect(collection.first()).toBe(elements[0]);
        });

        it('should return undefined if the collection is empty', () => {
            collection = new Collection();
            expect(collection.first()).toBeUndefined();
        });

        it('should find the first where the given callback passes', () => {
            expect(collection.first(item => item > 2)).toBe(3);
        });

        it('should return the first element regardless of index value', () => {
            delete collection[0];
            expect(collection.first()).toBe(elements[1]);
        });
    });

    describe('last()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should get the last item', () => {
            expect(collection.last()).toBe(elements[elements.length - 1]);
        });

        it('should return undefined if the collection is empty', () => {
            collection = new Collection();
            expect(collection.last()).toBeUndefined();
        });

        it('should find the last where the given callback passes', () => {
            expect(collection.last(item => item > 2)).toBe(5);
        });
    });

    describe('isEmpty()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should assert if the collection is empty', () => {
            expect(collection.isEmpty()).toBe(false);
            expect(new Collection().isEmpty()).toBe(true);
        });
    });

    describe('isNotEmpty()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should assert whether the collection is empty', () => {
            expect(collection.isNotEmpty()).toBe(true);
            expect(new Collection().isNotEmpty()).toBe(false);
        });
    });

    describe('hasDuplicates()', () => {
        let elements: any[] = [1, 2, 1, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should assert whether the collection has duplicates', () => {
            expect(collection.hasDuplicates()).toBe(true);
            expect(new Collection([1, 2]).hasDuplicates()).toBe(false);
        });

        it('should assert whether the collection has duplicates by key', () => {
            elements = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: '1' }, { id: 2 }];
            collection = new Collection(elements);
            expect(collection.hasDuplicates('id')).toBe(true);
            expect(new Collection([{ id: 1 }, { id: 2 }]).hasDuplicates('id')).toBe(false);
        });
    });

    describe('toArray()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should return all the elements in the collection', () => {
            expect(collection.toArray()).toBeInstanceOf(Array);
            expect(collection.toArray()).toHaveLength(elements.length);
            expect(collection.toArray()).not.toBeInstanceOf(Collection);
        });
    });

    describe('toJson()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should return the collection as a json string', () => {
            expect(typeof collection.toJson() === 'string').toBe(true);
        });
    });

    describe('unique()', () => {
        const elements = [1, 2, 1, '1'];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should remove duplicates', () => {
            expect(collection).toHaveLength(elements.length);
            expect(collection.unique()).toHaveLength(3);
        });

        it('should remove duplicates from an only objects array', () => {
            const items = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: '1' }, { id: 2 }];
            collection = new Collection(items);

            expect(collection).toHaveLength(items.length);
            expect(collection.unique()).toHaveLength(3);
        });

        it('should remove duplicates from an only objects array by key', () => {
            const items = [
                { id: 1, name: 'test' },
                { id: 2, name: 'test' },
                { id: 1, name: 'test' },
                { id: '1', name: 'test' },
                { id: 2, name: 'test' }
            ];

            collection = new Collection(items);
            expect(collection.unique('name')).toHaveLength(1);
        });

        it('should remove duplicates from an only objects array by a method', () => {
            const items = [
                { id: 1, name: 'test' },
                { id: 2, name: 'test' },
                { id: 1, name: 'test' },
                { id: '1', name: 'test' },
                { id: 2, name: 'test' }
            ];

            collection = new Collection(items);
            expect(
                collection.unique(obj => String(obj.id) + String(obj.name))
            ).toHaveLength(2);
        });

        it('should remove duplicates based on the given method', () => {
            expect(collection.unique(elem => String(elem) === '1')).toHaveLength(1);
        });

        it('can be chained', () => {
            expect(collection.unique().toArray()).toHaveLength(3);
        });
    });

    describe('duplicates()', () => {
        let elements: any[] = [1, 2, 1, '1', 2];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should retrieve only the duplicates', () => {
            expect(collection).toHaveLength(elements.length);
            expect(collection.duplicates()).toHaveLength(2);
        });

        it('should return an empty collection if no duplicates found', () => {
            expect(collection.take(2).duplicates()).toHaveLength(0);
        });

        it('can be chained', () => {
            expect(collection.duplicates().toArray()).toHaveLength(2);
        });

        it('should check duplicates of objects', () => {
            elements = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: '1' }, { id: 2 }];
            collection = new Collection(elements);

            expect(collection.duplicates()).toHaveLength(2);
        });

        it('should check duplicates by key on objects', () => {
            elements = [
                { id: 1, name: 'unique name' },
                { id: 2, name: 'name' },
                { id: 1, name: 'name' },
                { id: '1', name: 'name' },
                { id: 2, name: 'name' }
            ];
            collection = new Collection(elements);

            expect(collection.duplicates('name')).toHaveLength(1);
        });

        it('should check duplicates by calling a method with the objects', () => {
            elements = [
                { id: 1, name: 'unique name' },
                { id: 2, name: 'name' },
                { id: 1, name: 'name' },
                { id: '1', name: 'name' },
                { id: 2, name: 'name' }
            ];
            collection = new Collection(elements);

            expect(
                collection.duplicates((obj: Record<string, number|string>) => String(obj.id) + String(obj.name))
            ).toHaveLength(2);
        });
    });

    describe('delete()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should delete elements based on deep equality', () => {
            expect(collection.delete(elements[0])).toHaveLength(elements.length - 1);

            collection = new Collection([{ id: 1 }, { id: 2 }]);

            expect(collection.delete({ id: 2 })).toHaveLength(1);
            expect(collection.first()).toStrictEqual({ id: 1 });
        });

        it('should delete multiple elements', () => {
            collection.push(elements[0]);
            expect(collection.delete(elements[0])).toHaveLength(elements.length - 1);
        });

        it('can be chained', () => {
            expect(collection.delete(elements[0]).nth(1)).toHaveLength(elements.length - 1);
        });
    });

    describe('nth()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should return every nth element', () => {
            expect(collection.nth(2)).toHaveLength(2);
            expect(collection.includes(2) && collection.includes(4)).toBe(true);
        });

        it('can be chained', () => {
            expect(collection.nth(2).toArray()).toHaveLength(2);
        });
    });

    describe('pad()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should pad the end of the collection', () => {
            expect(collection.pad(7, 'my ending value')).toHaveLength(7);

            expect(collection.pad(7, 'my ending value').last()).toBe('my ending value');
        });

        it('should pad the beginning of the collection', () => {
            expect(collection.pad(-10, 'my starting value')).toHaveLength(10);

            expect(collection.pad(-10, 'my starting value').first()).toBe('my starting value');
        });

        it('should can take a function for the pad value', () => {
            expect(collection.pad(-10, () => true).first()).toBe(true);
        });

        it('should pad with undefined without value', () => {
            expect(collection.pad(7).last()).toBeUndefined();
        });

        it('can be chained', () => {
            expect(collection.pad(7).toArray()).toHaveLength(7);
        });
    });

    describe('when()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should mutate the collection conditionally with a boolean', () => {
            expect(collection.when(true, collection => collection.nth(2))).toHaveLength(2);

            expect(collection.when(false, collection => collection.nth(2))).toHaveLength(elements.length);
        });

        it('should mutate the collection conditionally with a closure resolving to boolean', () => {
            expect(
                collection.when(
                    () => true,
                    (collection) => collection.nth(2)
                )
            ).toHaveLength(2);

            collection = new Collection(elements);

            expect(
                collection.when(
                    () => true,
                    (collection) => collection.nth(2)
                )
            ).toHaveLength(2);
        });

        it('should pass the collection to the first argument if it\'s a function', () => {
            collection = new Collection(elements);

            //quick fix for https://github.com/facebook/jest/issues/2549
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mock = jest.fn((_collection: Collection<any>) => false);
            // @ts-expect-error
            const mockWrapper = ((...args: any[]) => mock(...args)) as unknown as () => boolean;

            expect(collection.when(mockWrapper, collection => collection.nth(2))).toHaveLength(elements.length);
            expect(mock).toHaveBeenCalledWith(collection);
        });

        it('should throws an error if the fist argument isn\'t boolean or function', () => {
            // @ts-expect-error
            const func = () => collection.when(null, () => {});
            expect(func).toThrow('when\' expect the first argument to be a type of boolean or function, \'object\' given.');
        });

        it('can be chained', () => {
            expect(collection.when(true, collection => collection).toArray()).toHaveLength(elements.length);
        });
    });

    describe('unless()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should mutate the collection conditionally with a boolean', () => {
            expect(collection.unless(false, (collection) => collection.nth(2))).toHaveLength(2);
            expect(collection.unless(true, (collection) => collection.nth(2))).toHaveLength(elements.length);
        });

        it('should mutate the collection conditionally with a closure resolving to boolean', () => {
            expect(
                collection.unless(
                    () => false,
                    (collection) => collection.nth(2)
                )
            ).toHaveLength(2);

            collection = new Collection(elements);

            expect(
                collection.unless(
                    () => false,
                    (collection) => collection.nth(2)
                )
            ).toHaveLength(2);
        });

        it('should passe the collection to the first argument if it\'s a function', () => {
            collection = new Collection(elements);

            // quick fix for https://github.com/facebook/jest/issues/2549
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mock = jest.fn((_collection: Collection<any>) => true);
            // @ts-expect-error
            const mockWrapper = ((...args: any[]) => mock(...args)) as unknown as () => boolean;

            expect(collection.unless(mockWrapper, (collection) => collection.nth(2))).toHaveLength(elements.length);
            expect(mock).toHaveBeenCalledWith(collection);
        });

        it('should throw an error if the fist argument isn\'t boolean or function', () => {
            // @ts-expect-error
            const func = () => collection.unless(null, () => {});
            expect(func).toThrow('\'unless\' expect the first argument to be a boolean or function');
        });

        it('can be chained', () => {
            expect(collection.unless(true, collection => collection).toArray()).toHaveLength(elements.length);
        });
    });

    describe('whenEmpty()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should only executes is the collection is empty', () => {
            const func = jest.fn((coll) => coll);

            collection.whenEmpty(func);
            expect(func).not.toHaveBeenCalled();
        });

        it('should call the passed closure', () => {
            collection = new Collection();
            const func = jest.fn((coll) => coll);

            collection.whenEmpty(func);
            expect(func).toHaveBeenCalledWith(collection);
        });

        it('can be chained', () => {
            collection = new Collection();

            expect(collection.whenEmpty((coll) => coll).toArray()).toHaveLength(0);
        });
    });

    describe('whenNotEmpty()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should only executes is the collection is not empty', () => {
            const func = jest.fn((coll) => coll);
            collection = new Collection();

            collection.whenNotEmpty(func);
            expect(func).not.toHaveBeenCalled();

            collection = new Collection(elements);

            collection.whenNotEmpty(func);
            // eslint-disable-next-line jest/prefer-called-with
            expect(func).toHaveBeenCalled();
        });

        it('should call the passed closure', () => {
            const func = jest.fn((coll) => coll);

            collection.whenNotEmpty(func);
            expect(func).toHaveBeenCalled();
            expect(func).toHaveBeenCalledWith(collection);
        });

        it('can be chained', () => {
            collection = new Collection();

            expect(collection.whenNotEmpty((coll) => coll).toArray()).toHaveLength(0);
        });
    });

    describe('random()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should return the value from the collection', () => {
            expect(collection).toContain(collection.random());
            expect(collection).toContain(collection.random());
        });

        it('should return the only available item if one argument given', () => {
            collection = new Collection([1]);
            expect(collection.random() === collection.random()).toBe(true);
        });

        it('should return undefined if no items are in the collection', () => {
            collection = new Collection();
            expect(collection.random()).toBeUndefined();
        });

        it('should return the whole collection if the given count is higher than the length', () => {
            expect(collection.random(collection.length * 2)).toStrictEqual(collection);
        });

        it('should return multiple random elements on count given', () => {
            expect(collection.random(2)).toHaveLength(2);
            expect(collection).toContain(collection.first());
        });

        it('can be chained when multiple random elements returned', () => {
            expect(collection.random(2).toArray()).toHaveLength(2);
        });
    });

    describe('union()', () => {
        const elements = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should join to the collection without duplicates', () => {
            expect(collection.union([{ id: 5 }, { id: 6 }])).toHaveLength(elements.length + 1);
        });

        it('should add the remaining values to the end of the array', () => {
            expect(collection.union([{ id: 5 }, { id: 6 }]).last()).toStrictEqual({ id: 6 });
        });

        it('can be chained', () => {
            expect(collection.union([{ id: 5 }, { id: 6 }]).nth(1)).toHaveLength(elements.length + 1);
        });
    });

    describe('diff()', () => {
        const elements = [1, 2, 3, 4, 5];
        const items = [2, 3, 4, 5, 6];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should get the difference the collection and the arguments', () => {
            expect(collection.diff(items)).toHaveLength(2);
        });

        it('can be chained', () => {
            expect(collection.diff(items).toArray()).toHaveLength(2);
        });
    });

    describe('intersect()', () => {
        const elements = [1, 2, 3, 4, 5];
        const items = [3, 4];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should get the intersection of the collection and the arguments', () => {
            expect(collection.intersect(items)).toHaveLength(2);
            expect(collection.intersect(items).indexOf(elements[0]) !== -1).toBe(false);
        });

        it('can be chained', () => {
            expect(collection.intersect(items).toArray()).toHaveLength(2);
        });
    });

    describe('dump()', () => {
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should dumps to the console', () => {
            jest.spyOn(console, 'info');
            // @ts-expect-error
            console.info.mockImplementation(() => {});
            collection.dump();

            expect(console.info).toHaveBeenCalled();

            // @ts-expect-error
            console.info.mockRestore();
        });

        it('should dump with a message', () => {
            jest.spyOn(console, 'info');
            // @ts-expect-error
            console.info.mockImplementation(() => {});
            collection.dump('test');

            expect(console.info).toHaveBeenCalledWith(
                new Date().toLocaleTimeString() + ' (test)' + ' - All items: ' + elements.toString()
            );

            // @ts-expect-error
            console.info.mockRestore();
        });

        it('can be chained', () => {
            jest.spyOn(console, 'info');
            // @ts-expect-error
            console.info.mockImplementation(() => {});

            expect(collection.dump().toArray()).toHaveLength(elements.length);

            // @ts-expect-error
            console.info.mockRestore();
        });
        /* eslint-enable @typescript-eslint/no-unsafe-call */
    });

    describe('chunk()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should chunk the collection into collections', () => {
            expect(collection.chunk(2)).toHaveLength(3);
            expect(Collection.isCollection(collection.chunk(2).first())).toBe(true);
        });

        it('can be chained', () => {
            expect(collection.chunk(2).toArray()).toHaveLength(3);
        });
    });

    describe('take()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should take the specified number of items', () => {
            expect(collection.take(2)).toHaveLength(2);
            expect(collection.take(0)).toHaveLength(0);
        });

        it('should return everything if the count is higher then the collection length', () => {
            expect(collection.take(elements.length * 2)).toHaveLength(elements.length);
        });

        it('should take items from the beginning', () => {
            expect(collection.take(2)).toStrictEqual(new Collection([1, 2]));
        });

        it('should take items from the end on negative argument', () => {
            expect(collection.take(-2)).toStrictEqual(new Collection([4, 5]));
        });

        it('can be chained', () => {
            expect(collection.take(2).nth(1).toArray()).toHaveLength(2);
        });
    });

    describe('takeWhile()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should take items from the collection while the condition is true', () => {
            expect(collection.takeWhile(item => item < 4)).toHaveLength(3);
        });

        it('can be chained', () => {
            expect(collection.takeWhile(item => item < 4).toArray()).toHaveLength(3);
        });
    });

    describe('takeUntil()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should take items from the collection until the condition is true', () => {
            expect(collection.takeUntil(item => item >= 4)).toHaveLength(3);
        });

        it('can be chained', () => {
            expect(collection.takeUntil(item => item >= 4).toArray()).toHaveLength(3);
        });
    });

    describe('skip()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should skip the specified number of items', () => {
            expect(collection.skip(2)).toHaveLength(3);
            expect(collection.skip(0)).toHaveLength(elements.length);
        });

        it('should skip items from the beginning', () => {
            const skippedCollection = collection.skip(4);
            expect(skippedCollection).toStrictEqual(new Collection([elements[elements.length - 1]]));
            expect(skippedCollection).toHaveLength(1);
        });

        it('should return the full collection if the count higher or equal the length', () => {
            expect(collection.skip(elements.length)).toStrictEqual(collection);
            expect(collection.skip(elements.length + 1)).toStrictEqual(collection);
        });

        it('should skip items from the end', () => {
            expect(collection.skip(-2)).toStrictEqual(collection.take(3));
        });

        it('can be chained', () => {
            expect(collection.skip(2).nth(1).toArray()).toHaveLength(3);
        });
    });

    describe('skipWhile()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should skip the elements while the condition is true', () => {
            expect(collection.skipWhile(item => item <= 2)).toHaveLength(3);
        });

        it('should skip items from the beginning', () => {
            expect(collection.skipWhile(item => item <= 4)).toStrictEqual(
                new Collection([elements[elements.length - 1]])
            );
            expect(collection.skipWhile(item => item <= 4)).toHaveLength(1);
        });

        it('can be chained', () => {
            expect(
                collection
                    .skipWhile(item => item <= 2)
                    .nth(1)
                    .toArray()
            ).toHaveLength(3);
        });
    });

    describe('skipUntil()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should skip the elements until the condition is true', () => {
            expect(collection.skipUntil(item => item > 2)).toHaveLength(3);
        });

        it('should skip items from the beginning', () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.skipUntil(item => item >= (elements[elements.length - 1] as number))).toStrictEqual(
                new Collection([elements[elements.length - 1]])
            );
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            expect(collection.skipUntil(item => item >= (elements[elements.length - 1] as number))).toHaveLength(1);
        });

        it('can be chained', () => {
            expect(
                collection
                    .skipUntil(item => item >= 2)
                    .nth(1)
                    .toArray()
            ).toHaveLength(4);
        });
    });

    describe('tap()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should execute a method with the collection passed to the closure', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const func = jest.fn((_collection: Collection<any>) => {});
            collection.tap(func);
            expect(func).toHaveBeenCalled();
            expect(func).toHaveBeenCalledWith(collection);
        });

        it('shouldn\'t be able to mutate the collection', () => {
            const func = (collection: Collection<any>) => collection.pad(10);
            collection.tap(func);
            expect(collection.tap(func)).toHaveLength(elements.length);
        });

        it('can be chained', () => {
            expect(collection.tap((coll) => coll).toArray()).toHaveLength(elements.length);
        });
    });

    describe('pipe()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should execute a method with the collection passed to the closure', () => {
            const func = jest.fn(collection => collection);
            collection.pipe(func);
            expect(func).toHaveBeenCalled();
            expect(func).toHaveBeenCalledWith(collection);
        });

        it('should mutate the collection', () => {
            const func = (collection: Collection<any>) => collection.pad(10);
            collection.pipe(func);
            expect(collection.pipe(func)).toHaveLength(10);
        });

        it('can be chained', () => {
            expect(collection.pipe((coll) => coll).toArray()).toHaveLength(elements.length);
        });
    });

    describe('pluck()', () => {
        const elements = [
            { id: 1, name: '1' },
            { id: 2, name: '2' },
            { id: 3, name: '3' },
            { id: 4, name: '4' },
            { id: 5, name: '5' }
        ];


        it('should pluck values from objects', () => {
            collection = new Collection(elements);

            expect(collection.pluck('id')).toHaveLength(elements.length);

            collection = new Collection(elements);

            expect(collection.pluck('id').first()).toBe(elements[0]?.id);
        });

        it('should pluck multiple values from objects', () => {
            collection = new Collection(elements);

            expect(collection.pluck(['id', 'name'])).toHaveLength(elements.length);

            collection = new Collection(elements);

            expect(JSON.stringify(collection.pluck(['id', 'name']).first())).toBe(JSON.stringify(elements[0]));
        });

        it('should throw an error if not every item is an object', () => {
            collection = new Collection(Array.of(null, ...elements));

            const func = () => collection.pluck('id');
            expect(func).toThrow('Every item needs to be an object to be able to access its properties');
        });

        it('can be chained', () => {
            collection = new Collection(elements);
            expect(collection.pluck('id').toArray()).toHaveLength(elements.length);
        });
    });

    describe('isCollection()', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        it('should determine if the given value is a collection or not', () => {
            expect(Collection.isCollection(collection)).toBe(true);
            const baseLanguageTypes = [1, '', null, undefined, NaN, true, () => {}, {}, []];

            baseLanguageTypes.forEach((type) => {
                expect(Collection.isCollection(type)).toBe(false);
            });
        });
    });

    describe('times()', () => {
        it('should return a collection', () => {
            expect(Collection.times(5, (i: number) => i)).toBeInstanceOf(Collection);
        });

        it('should have the expected length', () => {
            expect(Collection.times(5, (i: number) => i)).toHaveLength(5);
        });

        it('should have the expected elements', () => {
            expect(Collection.times(5, (i: number) => ({ id: i })).last()).toStrictEqual({ id: 5 });
            expect(Collection.times(5, (i: number) => ({ id: i })).first()).toStrictEqual({ id: 1 });
        });

        it('should take a function to execute or other types', () => {
            expect(Collection.times(5, 1).first()).toStrictEqual(1);
            expect(Collection.times(5, (i: number) => ({ id: i })).first()).toStrictEqual({ id: 1 });
            const test = class Test {};
            expect(Collection.times(5, new test()).first()).toBeInstanceOf(test);
        });

        it('can be chained', () => {
            expect(Collection.times(5, (i: number) => i).toArray()).toHaveLength(5);
        });
    });

    describe('array-methods', () => {
        const elements = [1, 2, 3, 4, 5];

        beforeEach(() => {
            collection = new Collection(elements);
        });

        describe('map()', () => {
            it('can be chained', () => {
                expect(collection.map(e => e).nth(1)).toHaveLength(5);
            });

            it('should transform values', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(collection.map(elem => elem * 2).first()).toStrictEqual((elements[0] as number) * 2);
            });

            it('should return a new collection', () => {
                collection.map(elem => elem * 2);
                expect(collection.first()).toStrictEqual(elements[0]);
            });
        });

        describe('flat()', () => {
            it('can be chained', () => {
                expect(collection.flat().nth(1)).toHaveLength(5);
            });

            it('should return a new collection', () => {
                collection.flat();
                expect(collection.first()).toStrictEqual(elements[0]);
            });

            it('should return itself if the collection is empty', () => {
                collection = new Collection();

                expect(collection.flat()).toStrictEqual(collection);
            });

            it('should flatten a collection of collections', () => {
                collection = new Collection([collection, collection]);

                expect(collection.flat()).toStrictEqual(new Collection([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]));
            });

            it('should flatten to 1 depth by default', () => {
                collection = new Collection([collection, collection]);

                expect(collection.flat()).toStrictEqual(new Collection([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]));

                collection = new Collection([
                    new Collection([new Collection(elements)]),
                    new Collection([new Collection(elements)])
                ]);

                expect(collection.flat()).toStrictEqual(new Collection([
                        new Collection(elements),
                        new Collection(elements)
                    ]));
            });

            it('should be able to flatten to Infinity', () => {
                collection = new Collection([collection, collection]);
                collection = new Collection([collection, collection]);

                expect(collection.flat(Infinity))
                    .toStrictEqual(new Collection([...elements, ...elements, ...elements, ...elements]));
            });
        });

        describe('flatMap()', () => {
            it('can be chained', () => {
                expect(collection.flatMap(elem => elem * 2).nth(1)).toHaveLength(5);
            });

            it('should return a new collection', () => {
                collection.flatMap(elem => elem * 2);
                expect(collection.first()).toStrictEqual(elements[0]);
            });
        });

        describe('lastIndexOf()', () => {
            it('should find the index of the last occurrence of the given item', () => {
                const lastElement = elements[elements.length - 1];
                collection[0] = lastElement;

                expect(collection.lastIndexOf(lastElement))
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    .toStrictEqual(elements.lastIndexOf(elements[elements.length - 1] as number));

                expect(collection.lastIndexOf('something')).toStrictEqual(-1);
            });

            it('should search for the last occurrence from the given index backwards', () => {
                const lastElement = elements[elements.length - 1];
                collection[1] = lastElement;

                expect(collection.lastIndexOf(lastElement, 3))
                    .toStrictEqual(1);
            });
        });

        describe('reverse()', () => {
            it('can be chained', () => {
                expect(collection.reverse().nth(1)).toHaveLength(5);
            });

            it('should reverse the collection', () => {
                const reversedCollection = collection.reverse();

                expect(reversedCollection.first()).toStrictEqual(elements[elements.length - 1]);
                expect(reversedCollection.last()).toStrictEqual(elements[0]);
            });
        });

        describe('concat()', () => {
            it('can be chained', () => {
                expect(collection.concat([6, 7]).nth(1)).toHaveLength(7);
            });

            it('should return a new collection', () => {
                collection.concat([6, 7]);
                expect(collection.first()).toStrictEqual(elements[0]);
            });
        });

        describe('foreEach()', () => {
            it('can be chained', () => {
                expect(collection.forEach(e => e).nth(1)).toHaveLength(5);
            });

            it('should call a method with each element', () => {
                let counter = 0;
                collection.forEach(() => counter++);
                expect(counter).toBe(collection.length);
            });
        });

        describe('splice()', () => {
            it('should return the spliced items', () => {
                expect(collection.splice(0, 2)).toStrictEqual(new Collection(elements.splice(0, 2)));
            });

            it('should transform the original object', () => {
                collection.splice(0, 2);
                expect(collection).toHaveLength(elements.length - 2);
            });

            it('can be chained', () => {
                expect(collection.splice(0, 1, 1).nth(1)).toHaveLength(1);
                expect(collection).toHaveLength(elements.length);
            });
        });

        describe('includes()', () => {
            /* eslint-disable jest/prefer-to-contain */
            const elements = [1, 2, 3, 4, 5];

            beforeEach(() => {
                collection = new Collection(elements);
            });

            it('should assert whether the collection includes an element', () => {
                expect(collection.includes(elements[0])).toBe(true);
                expect(collection.includes(Math.random())).toBe(false);
            });

            it('should use deep equality', () => {
                collection = new Collection([{ id: 1 }, { id: 2 }]);
                expect(collection.includes({ id: 1 })).toBe(true);
            });
            /* eslint-enable jest/prefer-to-contain */
        });

        describe('sort()', () => {
            it('can be chained', () => {
                collection = new Collection([1, 3, 5, 2, 4]);
                expect(collection.sort().nth(1)).toHaveLength(5);
                expect(collection.last()).toBe(4);
            });
        });

        describe('slice()', () => {
            it('can be chained', () => {
                expect(collection.slice(0, 1).nth(1)).toHaveLength(1);
            });
        });

        describe('filter()', () => {
            it('can be chained', () => {
                expect(collection.filter(e => e > 2).nth(1)).toHaveLength(3);
            });

            it('should filter undefined and null without arguments', () => {
                collection.push(null, undefined);
                expect(collection.filter()).toHaveLength(elements.length);
            });

            it('should return a new collection', () => {
                collection.filter(elem => !!elem);
                expect(collection.first()).toStrictEqual(elements[0]);
            });
        });

        describe('push()', () => {
            it('should add element to the end of the collection', () => {
                collection.push(6);
                expect(collection.last()).toStrictEqual(6);
            });

            it('should add multiple elements', () => {
                collection.push(6, 7);
                expect(collection.last()).toStrictEqual(7);
            });

            it('should return the new length of the collection', () => {
                expect(collection.push(6)).toStrictEqual(elements.length + 1);
            });

            it('should push an empty collection to the correct key', () => {
                collection = new Collection();
                collection.push(1);
                expect(collection[0]).toBe(1);
                // @ts-expect-error
                expect(collection['NaN']).toBeUndefined();
            });
        });

        describe('shift()', () => {
            it('should remove elements from the beginning of the collection', () => {
                collection.shift();
                expect(collection.first()).toStrictEqual(elements[1]);
                expect(collection).toHaveLength(elements.length - 1);
            });

            it('should return the removed value', () => {
                expect(collection.shift()).toStrictEqual(elements[0]);
            });

            it('should return undefined if the collection is empty', () => {
                expect(new Collection().shift()).toBeUndefined();
            });
        });

        describe('unshift()', () => {
            it('should add elements to the beginning of the collection', () => {
                collection.unshift('value');
                expect(collection.first()).toStrictEqual('value');
                expect(collection).toHaveLength(elements.length + 1);
            });

            it('should add multiple elements to the beginning of the collection', () => {
                collection.unshift('multiple', 'values');
                expect(collection.first()).toStrictEqual('multiple');
                expect(collection).toHaveLength(elements.length + 2);
            });

            it('should return the new length', () => {
                expect(collection.unshift(1)).toStrictEqual(elements.length + 1);
            });

            it('should unshift an empty collection to the correct key', () => {
                collection = new Collection();
                collection.unshift(1);
                expect(collection[0]).toBe(1);
                // @ts-expect-error
                expect(collection['NaN']).toBeUndefined();
            });
        });

        describe('copyWithin()', () => {
            it('should copy part of the array withing the array', () => {
                expect(collection.copyWithin(0, 2, 4).toArray())
                    .toStrictEqual(elements.copyWithin(0, 2, 4));
            });
        });

        describe('every()', () => {
            it('should assert that the given closure returns true for every item', () => {
                expect(collection.every(elem => !isNaN(elem))).toBe(true);

                collection.push('string');
                expect(collection.every(elem => !isNaN(elem))).toBe(false);
            });
        });

        describe('some()', () => {
            it('should assert that the given closure returns true for some of the item', () => {
                expect(collection.some(elem => typeof elem === 'string')).toBe(false);

                collection.push('string');
                expect(collection.some(elem => typeof elem === 'string')).toBe(true);
            });
        });

        describe('fill()', () => {
            it('should fill the collection with static values', () => {
                expect(collection.fill(10, 2, 3).toArray()).toStrictEqual(elements.fill(10, 2, 3));
            });
        });

        describe('find()', () => {
            it('should find items based on the given closure', () => {
                expect(collection.find(elem => elem === elements[0])).toStrictEqual(elements[0]);
            });
        });

        describe('findIndex()', () => {
            it('should find item\'s index based on the given closure', () => {
                expect(collection.findIndex(elem => elem === elements[0])).toStrictEqual(0);
            });
        });

        describe('indexOf()', () => {
            it('should return the index of the found element or -1 on not found', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(collection.indexOf(elements[0])).toStrictEqual(elements.indexOf(elements[0] as number));
                expect(collection.indexOf('something')).toStrictEqual(-1);
            });
        });

        describe('join()', () => {
            it('should join the collection elements with the given string', () => {
                expect(collection.join('+')).toBe(elements.join('+'));
            });

            it('should join the collection elements with the default "\'" string', () => {
                expect(collection.join()).toBe(elements.join());
            });
        });

        describe('toString()', () => {
            it('should return the string representation of the collection', () => {
                expect(collection.toString()).toBe(elements.toString());
            });
        });

        describe('reduce()', () => {
            const callback = (previousValue: number, currentValue: number) => previousValue + currentValue;
            it('should reduce the collection to a single value', () => {
                expect(collection.reduce(callback)).toStrictEqual(elements.reduce(callback));
            });

            it('should take an initial value', () => {
                expect(collection.reduce(callback, 1)).toStrictEqual(elements.reduce(callback, 1));
            });
        });

        describe('reduceRight', () => {
            const callback = (previousValue: number, currentValue: number) => previousValue + currentValue;

            it('should reduce the collection to a single value starting from the end.', () => {
                expect(collection.reduceRight(callback)).toStrictEqual(elements.reduceRight(callback));
            });

            it('should take an initial value', () => {
                expect(collection.reduceRight(callback, 1)).toStrictEqual(elements.reduceRight(callback, 1));
            });
        });
    });
});
