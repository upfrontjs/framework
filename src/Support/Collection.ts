import { isEqual, uniq } from 'lodash';
import type Arrayable from '../Contracts/Arrayable';
import type Jsonable from '../Contracts/Jsonable';
import InvalidArgumentException from '../Exceptions/InvalidArgumentException';

export default class Collection<T> implements Arrayable, Jsonable, Iterable<T>, ArrayLike<T> {
    /**
     * Allow indexing by number
     */
    [index: number]: T;

    /**
     * The constructor.
     *
     * @param {any[]} items
     *
     */
    constructor(items?: T|T[]) {
        if (!items) {
            return this;
        }

        let elements = items;

        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        if (elements.length === 0) {
            return this;
        }

        this._setArray(elements);

        return this;
    }

    /**
     * The length of the collection
     *
     * @type {number}
     */
    public length = 0;

    /**
     * The iterator used for looping the collection.
     *
     * @type {Symbol.iterator}
     */
    public *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.length; i++) {
            yield this[i] as T;
        }
    }

    /**
     * Workaround to return a new current class.
     *
     * @param {any[]|Collection} items
     *
     * @protected
     *
     * @return {this}
     */
    // todo - caveat to mention in docs
    // we cannot know what the extending class' arguments going to be,
    // while taking anything else than the items is unexpected is
    // not impossible that they may introduce an extra argument
    // due to poor design (any such should be a member method).
    // With this method it will only call the constructor
    // with the items.
    protected _newInstance(items?: T|T[]): this {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return new (this.constructor as any)(items);
    }

    /**
     * Set the values in context.
     *
     * @param {Array} array
     *
     * @private
     *
     * @return {this}
     */
    protected _setArray(array: T[]): this {
        for (const [index, value] of array.entries()) {
            this[index] = value;
        }
        this.length = array.length;

        return this;
    }

    /**
     * Return the first element in the collection,
     * if callback given the first element that  passes the truth test.
     * Otherwise undefined.
     *
     * @param {function} callback
     *
     * @return {undefined|any}
     */
    public first(callback?: ((item: T, index: number) => boolean)): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        if (!callback) {
            return this[Number(this.keys()[0])];
        }

        return this.toArray().filter((item, index) => callback(item, index))[0];
    }

    /**
     * Return the last element in the collection,
     * if callback given the last element that  passes the truth test.
     * Otherwise undefined.
     *
     * @param {function} callback
     *
     * @return {undefined|any}
     */
    public last(callback?: ((item: T, index: number) => boolean)): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        if (!callback) {
            return this[Number(this.keys().length - 1)];
        }

        return this.toArray()
            .reverse()
            .filter((item, index) => callback(item, index))[0];
    }

    /**
     * Return a random element(s) from the collection.
     *
     * @param {number} count
     *
     * @return {undefined|any|this}
     */
    public random(count = 1): T | undefined | this {
        count = Math.abs(count);

        if (!this.length) {
            return undefined;
        }

        if (count >= this.length) {
            return this;
        }

        if (count > 1) {
            const randomElements: T[] = [];

            for (let i = 0; i < count; i++) {
                randomElements.push(this[Math.floor(Math.random() * this.length)] as T);
            }

            return this._newInstance(randomElements);
        }

        const randomIndex = Math.floor(Math.random() * this.length);

        return this[randomIndex];
    }

    /**
     * Assert whether the collection
     * is empty or not.
     *
     * @return {boolean}
     */
    public isEmpty(): boolean {
        return !this.length;
    }

    /**
     * Assert whether the collection
     * is not empty or is empty.
     *.
     * @return {boolean}
     */
    public isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Assert whether there are duplicates
     * in the collection based deep equality.
     *
     * @param {string|undefined} key
     *
     * @return {boolean}
     */
    public hasDuplicates(key?: string | ((obj: T) => T)): boolean {
        return !!this._newInstance(this.toArray()).duplicates(key).length;
    }

    /**
     * De-duplicate the collection.
     * Optionally find duplicates by key or
     * the return value of a method called with the element.
     *
     * @param {string|function|undefined} key
     *
     * @return {this}
     */
    public unique(key?: string | ((obj: Record<string, any>) => T)): this {
        if (!this._allAreObjects()) {
            let values: T[];
            if (key instanceof Function) {
                const array = this.toArray();

                values = array.filter(item =>
                    array.filter(element => key(element) === key(item)).length === 1
                );
            } else {
                values = uniq(this.toArray());
            }

            return this._newInstance(values);
        }

        const objects: T[] = [];

        this.forEach(object => {
            let boolean: boolean;

            if (key instanceof Function) {
                boolean = !objects.some(obj => isEqual(key(obj), key(object)));
            } else if (key && key in object) {
                boolean = !objects.some(obj =>
                    isEqual((obj as Record<string, unknown>)[key], (object as Record<string, unknown>)[key])
                );
            } else {
                boolean = !objects.some(obj => isEqual(obj, object));
            }

            if (boolean) {
                objects.push(object);
            }
        });

        return this._newInstance(objects);
    }

    /**
     * Only keep the duplicated values in the collection.
     * Optionally if all items are object compare
     * by the given key or function.
     *
     * @param {string|function|undefined} key
     *
     * @return {this}
     */
    public duplicates(key?: string | ((obj: T) => T)): this {
        const array = this.toArray();

        if (!this._allAreObjects()) {
            const duplicates = array.filter(item => {
                return array.filter(element => isEqual(element, item)).length > 1;
            });

            return this._newInstance(uniq(duplicates));
        }

        const objects: T[] = [];

        this.forEach(object => {
            let boolean: boolean;

            if (key instanceof Function) {
                boolean =
                    array.filter(obj => isEqual(key(object), key(obj))).length > 1 &&
                    !objects.some(obj => isEqual(key(object), key(obj)));
            } else if (key && key in object) {
                boolean =
                    array.filter(obj => isEqual(
                        (object as Record<string, unknown>)[key],
                        (obj as Record<string, unknown>)[key])
                    ).length > 1
                    && !objects.some(obj => isEqual(
                        (object as Record<string, unknown>)[key],
                        (obj as Record<string, unknown>)[key])
                    );
            } else {
                boolean = array.filter(obj => isEqual(object, obj)).length > 1 &&
                    !objects.some(obj => isEqual(object, obj));
            }

            if (boolean) {
                objects.push(object);
            }
        });

        return this._newInstance(objects);
    }

    /**
     * Remove all items the are deep equal to the argument.
     *
     * @param {any} item
     *
     * @return {this}
     */
    public delete(item: T): this {
        return this._newInstance(this.filter(element => !isEqual(element, item)).toArray());
    }

    /**
     * Only keep every nth element in the collection.
     *
     * @param {number} every
     *
     * @return {this}
     */
    public nth(every: number): this {
        return this._newInstance(this.toArray().filter((_item, index) => (index + 1) % every === 0));
    }

    /**
     * Pad collection to the specified length with a value.
     * Negative length will pad the beginning of the collection.
     *
     * @param {number|function} length
     * @param {any|function|undefined} value
     *
     * @return {this}
     */
    public pad(length: number, value?: T | (() => T)): this {
        const needsPadding = this.length < Math.abs(length);
        const collection = this._newInstance(this.toArray());

        if (needsPadding) {
            const diff = Math.abs(length) - this.length;
            const end = 0 < length;

            if (value instanceof Function) {
                value = value();
            }

            if (!value) {
                value = undefined as unknown as T;
            }

            for (let i = 0; i < diff; i++) {
                end ? collection.push(value) : collection.unshift(value);
            }
        }

        return collection;
    }

    /**
     * Join this and the argument without overlapping values.
     *
     * @param {array|this} iterable
     *
     * @return {this}
     */
    public union(iterable: T[]): this {
        const collection = this._newInstance(this.toArray());
        collection.push(...iterable.filter(item => !this.includes(item)));

        return collection;
    }

    /**
     * Diff the collection with the given items.
     *
     * @param {any|any[]} values
     *
     * @return {this}
     */
    public diff(values: T|T[]): this {
        const argCollection = Collection.isCollection(values)
            ? values
            : new Collection(Array.isArray(values) ? values : [values]);

        const result: any[] = this.toArray().filter(item => {
            return !argCollection.includes(item);
        });

        result.push(argCollection.toArray().filter((arg: any) => !this.includes(arg)));

        return this._newInstance(result);
    }

    /**
     * Intersect the collection with the given values.
     *
     * @param {any|any[]} values
     *
     * @return {this}
     */
    public intersect(values: T|T[]): this {
        const argCollection = Collection.isCollection(values)
            ? values
            : new Collection(Array.isArray(values) ? values : [values]);

        return this._newInstance(this.toArray().filter(item => argCollection.includes(item)));
    }

    /**
     * Chunk the collection into chunks of the given size.
     *
     * @param {number} size
     *
     * @return {Collection}
     */
    public chunk(size: number): Collection<Collection<T>> {
        const result: Collection<T>[] = [];

        for (let i = 0; i < this.length; i++) {
            const start = i * size;

            if (start >= this.length) {
                continue;
            }

            result.push(this._newInstance(this.slice(start, start + size).toArray()));
        }

        return new Collection(result);
    }

    /**
     * Call a callback on the collection
     * when the first argument is Boolean(true) or
     * a closure called with the collection
     * resolving to a value converted to boolean.
     *
     * @param {function|boolean} boolean
     * @param {function} callback
     *
     * @return {this}
     */
    public when(
        boolean: ((collection: Collection<T>) => boolean) | boolean, callback: (collection: this) => this
    ): this {
        let bool: boolean;

        if (typeof boolean === 'boolean') {
            bool = boolean;
        } else if (boolean instanceof Function) {
            bool = !!boolean(this._newInstance(this.toArray()));
        } else {
            throw new InvalidArgumentException(
                '\'when\' expect the first argument to be a type of boolean or function, \''
                + typeof boolean + '\' given.'
            );
        }

        if (bool) {
            return callback(this._newInstance(this.toArray()));
        }

        return this;
    }

    /**
     * Call a callback on the collection
     * unless the first argument is Boolean(true) or
     * a closure called with the collection
     * resolving to a value converted to boolean.
     *
     * @param {function|boolean} boolean
     * @param {function} callback
     *
     * @return {this}
     */
    public unless(
        boolean: ((collection: Collection<T>) => boolean) | boolean,
        callback: (collection: this) => this
    ): this {
        let bool: boolean;

        if (typeof boolean === 'boolean') {
            bool = boolean;
        } else if (boolean instanceof Function) {
            bool = !!boolean(this._newInstance(this.toArray()));
        } else {
            throw new InvalidArgumentException(
                '\'unless\' expect the first argument to be a boolean or function \''
                + typeof boolean + '\' given.'
            );
        }

        if (!bool) {
            return callback(this._newInstance(this.toArray()));
        }

        return this;
    }

    /**
     * Call the given callback with the collection
     * if the collection is empty.
     *
     * @param {function} callback
     * @return {this}
     */
    public whenEmpty(callback: (collection: this) => void): this {
        if (this.isEmpty()) {
            callback(this);
        }

        return this;
    }

    /**
     * Call the given callback with the collection
     * if the collection is not empty.
     *
     * @param {function} callback
     * @return {this}
     */
    public whenNotEmpty(callback: (collection: this) => void): this {
        if (this.isNotEmpty()) {
            callback(this);
        }

        return this;
    }

    /**
     * Return the specified number of elements from the collection's
     * start or end on negative argument.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public take(count: number): this {
        if (Math.abs(count) > this.length) {
            return this;
        }

        const array = this.toArray();

        if (count < 0) {
            return this._newInstance(
                array
                    .reverse()
                    .filter((_item, index) => index + 1 <= Math.abs(count))
                    .reverse()
            );
        }

        return this._newInstance(array.filter((_item, index) => index + 1 <= count));
    }

    /**
     * Take items in the collection until the given closure
     * with the current item resolves to false.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public takeUntil(closure: (item: any) => boolean): this {
        const items: T[] = [];

        while (this.length && !closure(this[0])) {
            items.push(this.splice(0, 1)[0] as T);
        }

        return this._newInstance(items);
    }

    /**
     * Take items in the collection while the given closure
     * with the current item resolves to true.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public takeWhile(closure: (item: any) => boolean): this {
        const items: T[] = [];

        while (this.length && closure(this[0])) {
            items.push(this.splice(0, 1)[0] as T);
        }

        return this._newInstance(items);
    }

    /**
     * Skip items in the collection until the specified count
     * from the start or end based on the argument.
     *
     * @param {number} count
     *
     * @return {this}
     */
    public skip(count: number): this {
        if (count >= this.length) {
            return this._newInstance(this.toArray());
        }

        const array = this.toArray();

        if (count < 0) {
            return this._newInstance(
                array
                    .reverse()
                    .filter((_item, index) => index >= Math.abs(count))
                    .reverse()
            );
        }

        return this._newInstance(array.filter((_item, index) => index >= count));
    }

    /**
     * Skip items in the collection until the given closure
     * with the current item resolves to false.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public skipUntil(closure: (item: any) => boolean): this {
        const array = this.toArray();

        while (array.length && !closure(array[0])) {
            array.shift();
        }

        return this._newInstance(array);
    }

    /**
     * Skip items in the collection while the given closure
     * with the current item resolves to true.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public skipWhile(closure: (item: T) => boolean): this {
        const array = this.toArray();

        while (array.length && closure(array[0] as T)) {
            array.shift();
        }

        return this._newInstance(array);
    }

    /**
     * Get a collection with the values of a given key.
     *
     * @param {string|string[]} properties
     *
     * @return {this}
     *
     * @throws {Error}
     */
    public pluck(properties: string|string[]): Collection<any> | never {
        if (!this._allAreObjects()) {
            throw new TypeError('Every item needs to be an object to be able to access its properties');
        }

        if (Array.isArray(properties)) {
            return new Collection(
                this.map((item: Record<string, unknown>) => {
                    const obj: Record<string, unknown> = {};

                    properties.forEach(property => obj[property] = item[property]);

                    return obj;
                })
                    .toArray()
            );
        }

        return new Collection(this.map((item: Record<string, unknown>) => item[properties]).toArray());
    }

    /**
     * Pass a clone of the collection to a given function.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public tap(closure: (collection: Collection<T>) => void): this {
        closure(this._newInstance(this.toArray()));

        return this;
    }

    /**
     * Pass the collection to a given function.
     *
     * @param {function} closure
     *
     * @return {this}
     */
    public pipe(closure: (collection: this) => this): this {
        return closure(this._newInstance(this.toArray()));
    }

    /**
     * Print the collection values to the console.
     *
     * @param {string=} message
     * @return {this}
     */
    public dump(message?: string): this {
        const items = !window || !global ? JSON.stringify(this) : this;

        console.info(
            new Date().toLocaleTimeString()
            + (message ? ' (' + message + ')' : '')
            + ' - All items: ' + items.toString()
        );

        return this;
    }

    /**
     * Get the indexes for the collection items
     */
    public keys(): string[] {
        return Object.keys(this).filter((propName: string) => !isNaN(Number(propName)));
    }

    /**
     * @inheritDoc
     */
    public toArray(): T[] {
        return Array.from(this);
    }


    /**
     * @inheritDoc
     */
    public toJson(): string {
        return JSON.stringify(this);
    }

    /**
     * Asserts whether the given value
     * is an instance of Collection.
     *
     * @param {any} value
     *
     * @return {boolean}
     */
    public static isCollection<V>(value: unknown): value is Collection<V> {
        return value instanceof Collection;
    }

    /**
     * Create a new collection from the evaluated
     * callback or value the given number of times.
     *
     * @param {number} number
     * @param {any|function} value
     *
     * @return {this}
     */
    public static times<T>(number: number, value: ((index: number) => T) | T): Collection<T> {
        const items = [];

        for (let i = 1; i < number + 1; i++) {
            items.push(value instanceof Function ? value(i) : value);
        }

        return new this(items);
    }

    /**
     * Assert whether the given value is in the collection using deep equality.
     *
     * @param {any} value
     *
     * @return {boolean}
     */
    public includes(value: unknown): boolean {
        return this.some(item => isEqual(item, value));
    }

    /**
     * @override
     *
     * @param {function} callback
     * @param {object} thisArg
     *
     * @return {this}
     */
    public forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: Array<any>): this {
        this.toArray().forEach(callback, thisArg);

        return this;
    }

    /**
     * @inheritDoc
     *
     * @return {this}
     */
    public map<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any): Collection<U> {
        return new Collection(this.toArray().map(callback, thisArg));
    }

    /**
     * @inheritDoc
     *
     * @return {this}
     */
    public reverse(): this {
        return this._newInstance(this.toArray().reverse());
    }

    /**
     * @inheritDoc
     *
     * @return {this}
     */
    public concat(...items: ConcatArray<T>[]): this {
        return this._newInstance(this.toArray().concat(...items));
    }

    /**
     * @inheritDoc
     *
     * @return {this}
     */
    public sort(compareFn?: (a: T, b: T) => number): this {
        return this._newInstance(this.toArray().sort(compareFn));
    }

    /**
     * @see {Array.prototype.splice}
     *
     * @return {Collection}
     */
    public splice(start: number, deleteCount: number, ...items: T[]): Collection<T> {
        const array = this.toArray();
        const removedElements = array.splice(start, deleteCount, ...items);

        this._setArray(array);

        return this._newInstance(removedElements);
    }

    /**
     * @see {Array.prototype.slice}
     *
     * @return {this}
     */
    public slice(start?: number, end?: number): Collection<T> {
        return this._newInstance(this.toArray().slice(start, end));
    }

    /**
     * @see {Array.prototype.filter}
     *
     * If called without argument it filters undefined and null values.
     *
     * @return {this}
     */
    public filter(predicate?: (value: T, index: number, array: T[]) => boolean, thisArg?: any): Collection<T> {
        predicate = predicate ?? function (value: T) {
            return value !== null && value !== undefined;
        };

        return this._newInstance(this.toArray().filter(predicate, thisArg));
    }

    /**
     * @see {Array.prototype.flat}
     *
     * @return {Collection}
     */
    public flat(depth = 1): Collection<unknown> {
        const collection = new Collection();

        if (this.isEmpty()) {
            return collection;
        }

        if (depth > 0) {
            this.forEach(item => {
                if (Collection.isCollection(item)) {
                    collection.push(...item.flat(depth - 1));
                } else {
                    collection.push(item);
                }
            });
        } else {
            collection.push(...this.toArray());
        }

        return collection;
    }

    /**
     * @inheritDoc
     *
     * @return {Collection}
     */
    public flatMap<U, This = undefined>(
        callback: (this: This, value: T, index: number, array: T[]) => (ReadonlyArray<U> | U),
        thisArg?: This
    ): Collection<U> {
        return new Collection(this.toArray().flatMap(callback, thisArg));
    }

    /**
     * @see {Array.prototype.shift}
     */
    public shift(): T | undefined {
        if (!this.length) {
            return undefined;
        }

        const value = this.first();

        this._setArray(this.filter((_val, index) => index !== 0).toArray());

        return value;
    }

    /**
     * @see {Array.prototype.unshift}
     */
    public unshift(...items: T[]): number {
        this._setArray([...items, ...this]);

        return this.length;
    }

    /**
     * @see {Array.prototype.push}
     */
    public push(...items: T[]): number {
        // ensure indexes are continuous
        let key = this.length ? Number(this.keys()[this.length - 1]) + 1 : 0;

        for (const item of items) {
            this[key] = item;
            key++;
        }

        this.length += items.length;

        return this.length;
    }

    /**
     * @see {Array.prototype.fill}
     */
    public fill(value: T, start?: number, end?: number): this {
        this._setArray(this.toArray().fill(value, start, end));

        return this;
    }

    /**
     * @see {Array.prototype.copyWithin}
     */
    public copyWithin(target: number, start: number, end?: number): this {
        return this._newInstance(this.toArray().copyWithin(target, start, end));
    }

    /**
     * @see {Array.prototype.every}
     */
    public every(predicate: (value: T, index?: number, array?: T[]) => unknown, thisArg?: any): boolean {
        return this.toArray().every(predicate, thisArg);
    }

    /**
     * @see {Array.prototype.some}
     */
    public some(predicate: (value: T, index?: number, array?: T[]) => unknown, thisArg?: any): boolean {
        return this.toArray().some(predicate, thisArg);
    }

    /**
     * @see {Array.prototype.find}
     */
    public find(predicate: (value: T, index?: number, obj?: T[]) => unknown, thisArg?: any): T | undefined {
        return this.toArray().find(predicate, thisArg);
    }

    /**
     * @see {Array.prototype.findIndex}
     */
    public findIndex(predicate: (value: T, index?: number, obj?: T[]) => unknown, thisArg?: any): number {
        return this.toArray().findIndex(predicate, thisArg);
    }

    /**
     * @see {Array.prototype.indexOf}
     */
    public indexOf(searchElement: T, fromIndex = 0): number {
        return this.toArray().indexOf(searchElement, fromIndex);
    }

    /**
     * @see {Array.prototype.join}
     */
    public join(separator?: string): string {
        return this.toArray().join(separator);
    }

    /**
     * @see {Array.prototype.toString}
     */
    public toString(): string {
        return this.join();
    }

    /**
     * @see {Array.prototype.lastIndexOf}
     */
    public lastIndexOf(searchElement: T, fromIndex?: number): number {
        if (fromIndex) {
            return this.toArray().lastIndexOf(searchElement, fromIndex);
        }

        return this.toArray().lastIndexOf(searchElement);
    }

    /**
     * @see {Array.prototype.reduce}
     */
    public reduce(
        callback: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
        initialValue?: T
    ): T{
        if (!initialValue) {
            return this.toArray().reduce(callback);
        }

        return this.toArray().reduce(callback, initialValue);
    }

    /**
     * @see {Array.prototype.reduceRight}
     */
    public reduceRight(
        callback: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T,
        initialValue?: T
    ): T {
        if (!initialValue) {
            return this.toArray().reduceRight(callback);
        }

        return this.toArray().reduceRight(callback, initialValue);
    }

    /**
     * Determine whether all the values in this are objects.
     *
     * @private
     *
     * @return {boolean}
     */
    protected _allAreObjects(): this is Collection<Record<string, any>> {
        return this.every(item => typeof item === 'object' && item !== null);
    }
}
