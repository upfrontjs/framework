import Collection from '../Support/Collection';
import Model from './Model';
import InvalidArgumentException from '../Exceptions/InvalidArgumentException';

export default class ModelCollection<T> extends Collection<any> {
    constructor(models?: T[]) {
        super(models);
        this._throwIfNotModels();
    }

    /**
     * Throw error if not every item is a Model.
     *
     * @param {any[]} iterable
     *
     * @private
     */
    protected _throwIfNotModels(iterable: any = null): void {
        if (!this._isModelArray(iterable)) {
            throw new InvalidArgumentException(this.constructor.name + ' can only handle Model values.');
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

        return this.every(item => item instanceof Model);
    }

    /**
     * Accepts ModelCollection, array of models, numbers and strings
     * in array format. All other values are discarded.
     * Return a array of ids in a string format.
     *
     * @param {...any} values
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
        const ids = this.map((model: Model) => model.getKey());

        return new Collection(ids.toArray());
    }

    /**
     * Find the Model(s) based on the given key(s).
     *
     * @param {string|number|string[]|number[]} key
     *
     * @return {Model|ModelCollection|undefined}
     */
    find(...key: number[]|string[]): this|Model|undefined {
        this._throwIfNotModels();

        const keys = new Set(this._getArgumentKeys(key));

        const result: Model[] = [];

        keys.forEach(key => {
            const model = this.toArray().find((model: Model) => String(model.getKey()) === key);

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

        return undefined;
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
    unique(key?: string|((model: Model) => any)): this {
        this._throwIfNotModels();
        const modelArray: Model[] = [];

        this.forEach((model: Model) => {
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
    hasDuplicates(key?: string): boolean {
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
    duplicates<U>(key?: string|((model: Model) => U)): this {
        this._throwIfNotModels();

        const array: Model[] = this.toArray();
        const values: Model[] = [];

        this.forEach((model: Model) => {
            let boolean: boolean;

            if (key instanceof Function) {
                boolean =
                    !values.some((item) => key(item) === key(model)) &&
                    array.filter((item) => key(item) === key(model)).length > 1;
            } else if (key && model[key] !== undefined) {
                if (model[key] instanceof Function) {
                    boolean =
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        !values.some((item) => item[key]() === model[key]()) &&
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        array.filter((item) => item[key]() === model[key]()).length > 1;
                } else {
                    boolean =
                        !values.some((item) => item[String(key)] === model[String(key)]) &&
                        array.filter((item) => item[String(key)] === model[String(key)]).length > 1;
                }
            } else {
                boolean =
                    !values.some((item) => item.is(model)) &&
                    array.filter((item: Model) => item.is(model)).length > 1;
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
     * @param {...Model|ModelCollection|Model[]} models
     *
     * @return {this}
     */
    diff(...models: Model[]): this {
        this._throwIfNotModels();
        const modelCollection = new ModelCollection(models.flat());

        const result = this.toArray().filter((item) => {
            return !modelCollection.includes(item);
        });

        result.push(...modelCollection.toArray().filter((arg) => !this.includes(arg)));

        return this._newInstance(result);
    }

    /**
     * Only return the models with ids from the arguments.
     *
     * @param {...any} values
     *
     * @return {this}
     */
    only(...values: (string|number|Model)[]): this {
        this._throwIfNotModels();
        const modelKeys = this._getArgumentKeys(values);

        return this._newInstance(this.toArray().filter((model: Model) => modelKeys.includes(String(model.getKey()))));
    }

    /**
     * Return all models except models with ids from the arguments.
     *
     * @param {...any} values
     *
     * @return {this}
     */
    except(values: any|any[]): this {
        this._throwIfNotModels();
        const modelKeys = this._getArgumentKeys(values);

        return this._newInstance(this.toArray().filter((model: Model) => !modelKeys.includes(String(model.getKey()))));
    }

    /**
     * Asserts whether the given value
     * is an instance of ModelCollection.
     *
     * @param value
     *
     * @return {boolean}
     */
    static isModelCollection(value: any): value is ModelCollection<any> {
        if (!Collection.isCollection(value)) {
            return false;
        }

        return this.prototype._isModelArray(value) && value instanceof ModelCollection;
    }

    /**
     * Return only models that are both in
     * the arguments and the collection.
     *
     * @param {...Model|ModelCollection|Model[]} models
     *
     * @return {this}
     */
    intersect(...models: Model[]): this {
        this._throwIfNotModels();
        this._throwIfNotModels(Array.from(models).flat());

        return super.intersect(Array.from(models).flat());
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
    delete(model: Model): this {
        this._throwIfNotModels();

        return this._newInstance(this.toArray().filter((item: Model) => !item.is(model)));
    }

    /**
     * Join this and the argument without overlapping models.
     *
     * @param {ModelCollection|Model[]} iterable
     *
     * @return {this}
     */
    union(iterable: Model[]|ModelCollection<Model>): this {
        this._throwIfNotModels(iterable);

        const collection = this._newInstance(this.toArray());
        collection.push(...iterable.filter((model: Model) => !this.includes(model)));

        return collection;
    }

    /**
     * Assert whether the given model is in the collection.
     *
     * @param {Model|number|string} model
     *
     * @return {boolean}
     */
    includes(model: Model): boolean {
        this._throwIfNotModels();
        const id = this._getArgumentKeys(model)[0];

        return !!this.toArray().filter((item: Model) => String(item.getKey()) === id).length;
    }

    /**
     * The push override.
     *
     * @param {...Model} items
     */
    push(...items: Model[]): number {
        this._throwIfNotModels(Array.of(...items).flat());

        return super.push(...items);
    }

    /**
     * The unshift override.
     *
     * @param {...Model} items
     */
    unshift(...items: Model[]): number {
        this._throwIfNotModels(items.flat());

        return super.unshift(...items);
    }
}
