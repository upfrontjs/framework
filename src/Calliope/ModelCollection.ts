import Collection from '../Support/Collection';
import Model from './Model';

export default class ModelCollection<T extends Model> extends Collection<T> {
    constructor(models?: T[]) {
        super(models);
        this._throwIfNotModels();
    }

    /**
     * Throw error if not every item is a Model.
     *
     * @param {any[]=} iterable
     *
     * @private
     */
    protected _throwIfNotModels(iterable: any = null): void {
        if (!this._isModelArray(iterable)) {
            throw new TypeError(this.constructor.name + ' can only handle Model values.');
        }
    }

    /**
     * Determine if the given iterable or
     * this is a an array of Models.
     *
     * @param {any[]} iterable
     *
     * @return {boolean}
     *
     * @private
     */
    protected _isModelArray(iterable: any = null): iterable is Model[] {
        if (iterable && Array.isArray(iterable)) {
            return !!iterable.length && iterable.every((item) => item instanceof Model);
        }

        // the below instanceof check is not redundant
        // once this is transformed into javascript
        return this.every(item => item instanceof Model);
    }

    /**
     * Accepts ModelCollection, array of models, numbers and strings
     * in array format. All other values are discarded.
     * Return a array of ids in a string format.
     *
     * @param {any} values
     *
     * @return {string[]}
     *
     * @private
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
                .filter(arg => typeof arg === 'string' || typeof arg === 'number' || arg instanceof Model)
                .map(arg => String(arg instanceof Model ? arg.getKey() : arg))
        );
    }

    /**
     * Get the primary keys of the models.
     *
     * @return {Collection<number|string>}
     */
    modelKeys(): Collection<number|string> {
        this._throwIfNotModels();
        const ids = this.map(model => model.getKey());

        return new Collection(ids.toArray());
    }

    /**
     * Find the Model(s) based on the given key(s).
     *
     * @param {string|number|string[]|number[]} key
     * @param {any} defaultVal
     *
     * @return {Model|ModelCollection|undefined|any}
     */
    public findByKey(key: (number|string)[]|number|string, defaultVal?: any): this|T|undefined|any {
        this._throwIfNotModels();

        const keys = new Set(this._getArgumentKeys(key));

        const result: T[] = [];

        keys.forEach(key => {
            const model = this.toArray().find(model => String(model.getKey()) === key);

            if (model) {
                result.push(model);
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
    public unique(key?: string|((model: T) => any)): this {
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
    public hasDuplicates(key?: string): boolean {
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
    public duplicates<U>(key?: string|((model: T) => U)): this {
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
    public diff(models: T|T[]): this {
        this._throwIfNotModels();
        const modelCollection = (ModelCollection.isModelCollection(models)
            ? models
            : new ModelCollection(Array.isArray(models) ? models : [models])) as ModelCollection<T>;

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
    public only(values: any|any[]): this {
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
    public except(values: any|any[]): this {
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
    static isModelCollection<M extends Model>(value: any): value is ModelCollection<M> {
        if (!Collection.isCollection(value)) {
            return false;
        }

        return this.prototype._isModelArray(value) && value instanceof ModelCollection;
    }

    /**
     * Return only models that are both in
     * the arguments and the collection.
     *
     * @param {Model|ModelCollection|Model[]} models
     *
     * @return {this}
     */
    public intersect(models: T|T[]): this {
        models = (ModelCollection.isModelCollection(models)
            ? models.toArray()
            : Array.isArray(models) ? models : [models]) as T[];

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
    public delete(model: T): this {
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
    public union(iterable: T[]|ModelCollection<T>): this {
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
    public includes(model: T): boolean {
        this._throwIfNotModels();
        const id = this._getArgumentKeys(model)[0];

        return !!this.toArray().filter(item => String(item.getKey()) === id).length;
    }

    /**
     * The push override.
     *
     * @param {...Model} items
     */
    public push(...items: T[]): number {
        this._throwIfNotModels(Array.of(...items));

        return super.push(...items);
    }

    /**
     * The unshift override.
     *
     * @param {...Model} items
     */
    public unshift(...items: T[]): number {
        this._throwIfNotModels(Array.of(...items));

        return super.unshift(...items);
    }
}
