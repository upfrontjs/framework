import Collection from '../Support/Collection';
import type Model from './Model';

export default class ModelCollection<T extends Model> extends Collection<T> {
    public constructor(models?: T | T[]) {
        super(models);
        this._throwIfNotModels();
    }

    /**
     * Throw error if not every item is a Model.
     *
     * @param {any[]=} iterable
     *
     * @protected
     */
    protected _throwIfNotModels(iterable?: any): void {
        if (Collection.isCollection(iterable)) {
            iterable = iterable.toArray();
        }

        if (!iterable) {
            iterable = this.toArray();
        }

        if (Array.isArray(iterable) && !iterable.length) return;

        if (!ModelCollection._isModelArray(iterable)) {
            throw new TypeError(this.constructor.name + ' can only handle Model values.');
        }
    }

    /**
     * Determine if the given array is a Model array.
     *
     * @param {any} array
     *
     * @return {boolean}
     *
     * @protected
     */
    protected static _isModelArray(array: any): array is Model[] {
        if (!Array.isArray(array)) {
            return false;
        }

        return !!array.length && array.every(item => this._isModel(item));
    }

    /**
     * Check whether the given argument is (probably) model or not.
     *
     * @param {any} arg
     *
     * @return {boolean}
     *
     * @protected
     */
    protected static _isModel(arg: any): arg is Model {
        return typeof arg === 'object'
            && arg !== null
            && (arg as Record<string, any>).getKey instanceof Function
            && (arg as Record<string, any>).getName instanceof Function;
    }

    /**
     * Accepts ModelCollection, array of models, numbers and strings
     * in array format. All other values are discarded.
     * Returns a collection of ids in a string format.
     *
     * @param {any} values
     *
     * @return {string[]}
     *
     * @protected
     */
    protected _getArgumentKeys(values: any): Collection<string> {
        if (values instanceof ModelCollection) {
            return values.modelKeys().map(id => String(id));
        }

        if (values instanceof Collection) {
            values = values.toArray();
        }

        const args = Array.isArray(values) ? values : [values];

        return new Collection(
            args
                .flat()
                .filter(arg => typeof arg === 'string' || typeof arg === 'number' || ModelCollection._isModel(arg))
                .map(arg => String(ModelCollection._isModel(arg) ? arg.getKey() : arg))
        );
    }

    /**
     * Get the primary keys of the models.
     *
     * @return {Collection<number|string>}
     */
    public modelKeys(): Collection<number | string | undefined> {
        this._throwIfNotModels();
        return this.map(model => model.getKey());
    }

    /**
     * Find the Model(s) based on the given key(s).
     *
     * @param {string|number|string[]|number[]} key
     * @param {any} defaultVal
     *
     * @return {Model|ModelCollection|undefined|any}
     */
    public findByKey(
        key: (number | string)[] | number | string,
        defaultVal?: ModelCollection<T> | T
    ): T | any | this | undefined {
        this._throwIfNotModels();

        const keys = new Set(this._getArgumentKeys(key));

        const result: T[] = [];

        keys.forEach(argumentKey => {
            const modelHit = this.toArray().find(model => String(model.getKey()) === argumentKey);

            if (modelHit) {
                result.push(modelHit);
            }
        });

        if (result.length) {
            if (result.length === 1) {
                return result[0];
            }

            return this._newInstance(result);
        }

        return defaultVal;
    }

    /**
     * De-duplicate the collection.
     * Optionally find duplicates by key or method on model.
     * If key is undefined on the model, fall back to model check.
     *
     * @param {string|undefined} key
     *
     * @return {this}
     */
    public override unique(key?: string | ((model: T) => any)): this {
        this._throwIfNotModels();
        const modelArray: T[] = [];

        this.forEach(model => {
            let boolean;

            if (key || key && key in model) {
                if (key instanceof Function) {
                    boolean = !modelArray.some(item => key(item) === key(model));
                } else if (key in model && model[key] instanceof Function) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    boolean = !modelArray.some(item => item[key]() === model[key]());
                } else {
                    boolean = !modelArray.some(item  => item[String(key)] === model[String(key)]);
                }
            } else {
                boolean = !modelArray.some(item => item.is(model));
            }

            if (boolean) {
                modelArray.push(model);
            }
        });

        return this._newInstance(modelArray);
    }

    /**
     * Assert whether there are duplicates in the collection.
     *
     * @param {string|function|undefined} key
     *
     * @return {boolean}
     */
    public override hasDuplicates(key?: string): boolean {
        return !!new ModelCollection(this.toArray()).duplicates(key).length;
    }

    /**
     * Only keep one instance of duplicated values in the collection.
     * Optionally find duplicates by key, method name or passed in method.
     * If key is undefined on the model, fall back to model check.
     *
     * @param {string|function} key
     *
     * @return {this}
     */
    public override duplicates<U>(key?: string | ((model: T) => U)): this {
        this._throwIfNotModels();

        const array: T[] = this.toArray();
        const values: T[] = [];

        this.forEach(model => {
            let boolean: boolean;

            if (key instanceof Function) {
                boolean =
                    !values.some(item => key(item) === key(model)) &&
                    array.filter(item => key(item) === key(model)).length > 1;
            } else if (key && model[key] !== undefined) {
                if (model[key] instanceof Function) {
                    boolean =
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        !values.some(item => item[key]() === model[key]()) &&
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        array.filter(item => item[key]() === model[key]()).length > 1;
                } else {
                    boolean =
                        !values.some(item => item[String(key)] === model[String(key)]) &&
                        array.filter(item => item[String(key)] === model[String(key)]).length > 1;
                }
            } else {
                boolean =
                    !values.some(item => item.is(model)) &&
                    array.filter(item => item.is(model)).length > 1;
            }

            if (boolean) {
                values.push(model);
            }
        });

        return this._newInstance(values);
    }

    /**
     * Return only the models that are not in
     * both the argument and in the collection.
     *
     * @param {Model|ModelCollection|Model[]} models
     *
     * @return {this}
     */
    public override diff(models: T | T[]): this {
        this._throwIfNotModels();
        const modelCollection = ModelCollection.isModelCollection<T>(models)
            ? models
            : new ModelCollection(Array.isArray(models) ? models : [models]);

        const result = this.toArray().filter((item) => {
            return !modelCollection.includes(item);
        });

        result.push(...modelCollection.toArray().filter(arg => !this.includes(arg)));

        return this._newInstance(result);
    }

    /**
     * Only return the models with ids from the arguments.
     *
     * @param {any} values
     *
     * @return {this}
     */
    public only(values: any[] | any): this {
        this._throwIfNotModels();
        const modelKeys = this._getArgumentKeys(values);

        return this._newInstance(this.toArray().filter(model => modelKeys.includes(String(model.getKey()))));
    }

    /**
     * Return all models except models with ids from the arguments.
     *
     * @param {any} values
     *
     * @return {this}
     */
    public except(values: any[] | any): this {
        this._throwIfNotModels();
        const modelKeys = this._getArgumentKeys(values);

        return this._newInstance(this.toArray().filter(model => !modelKeys.includes(String(model.getKey()))));
    }

    /**
     * Asserts whether the given value
     * is an instance of ModelCollection.
     *
     * @param value
     *
     * @return {boolean}
     */
    public static isModelCollection<M extends Model>(value: any): value is ModelCollection<M> {
        if (!Collection.isCollection(value)) {
            return false;
        }

        return value instanceof ModelCollection && this._isModelArray(value);
    }

    /**
     * Return only models that are both in
     * the arguments and the collection.
     *
     * @param {Model|ModelCollection|Model[]} models
     *
     * @return {this}
     */
    public override intersect(models: T | T[]): this {
        models = ModelCollection.isModelCollection<T>(models)
            ? models.toArray()
            : Array.isArray(models) ? models : [models];

        this._throwIfNotModels();
        this._throwIfNotModels(models);

        return super.intersect(models);
    }

    /**
     * Remove all models that are same as the argument
     * based on the Model's 'is()' method.
     *
     * @param {Model} model
     *
     * @return {this}
     *
     * @see Model#is
     */
    public override delete(model: T): this {
        this._throwIfNotModels();

        return this._newInstance(this.toArray().filter(item => !item.is(model)));
    }

    /**
     * Join this and the argument without overlapping models.
     *
     * @param {ModelCollection|Model[]} iterable
     *
     * @return {this}
     */
    public override union(iterable: ModelCollection<T> | T[]): this {
        this._throwIfNotModels(iterable);

        const collection = this._newInstance(this.toArray());
        collection.push(...iterable.filter((model: T) => !this.includes(model)));

        return collection;
    }

    /**
     * Assert whether the given model is in the collection.
     *
     * @param {Model|number|string} model
     *
     * @return {boolean}
     */
    public override includes(model: T): boolean {
        this._throwIfNotModels();
        const id = this._getArgumentKeys(model)[0];

        return !!this.toArray().filter(item => String(item.getKey()) === id).length;
    }

    /**
     * The push override.
     *
     * @param {...Model} items
     */
    public override push(...items: T[]): number {
        this._throwIfNotModels(Array.of(...items));

        return super.push(...items);
    }

    /**
     * The unshift override.
     *
     * @param {...Model} items
     */
    public override unshift(...items: T[]): number {
        this._throwIfNotModels(Array.of(...items));

        return super.unshift(...items);
    }

    /**
     * @inheritDoc
     */
    public override map<U extends Model | unknown>(
        callback: (value: T, index: number, array: T[]) => U,
        thisArg?: any
    ): [U] extends [Model] ? ModelCollection<U> : Collection<U> {
        const results = super.map(callback, thisArg);

        if (results.every(result => ModelCollection._isModel(result))) {
            // @ts-expect-error
            return new (this.constructor as typeof ModelCollection)(results.toArray());
        }

        // @ts-expect-error
        return results;
    }

    /**
     * @inheritDoc
     */
    public override toJson(): string {
        return JSON.stringify(this.toArray().map(model => JSON.parse(model.toJson())));
    }
}
