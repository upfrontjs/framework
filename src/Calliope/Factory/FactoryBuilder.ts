import type Model from '../Model';
import type { Attributes, SimpleAttributes } from '../Concerns/HasAttributes';
import ModelCollection from '../ModelCollection';
import Factory from './Factory';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import GlobalConfig from '../../Support/GlobalConfig';
import Collection from '../../Support/Collection';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';
import { isUserLandClass } from '../../Support/function';
import { plural, singular } from '../../Support/string';
import type Configuration from '../../Contracts/Configuration';
import type { MaybeArray } from '../../Support/type';

type State<T extends Factory<Model>> = Exclude<keyof T, 'definition' | 'getClassName' | 'random'>;

export default class FactoryBuilder<T extends Model, F extends Factory<T> = Factory<T>> {
    /**
     * The number of models to create.
     *
     * @protected
     *
     * @type {number}
     */
    protected amount = 1;

    /**
     * The model to be constructed.
     *
     * @protected
     *
     * @type {Model}
     */
    public readonly model: T;

    /**
     * The memoized factory instance.
     *
     * @protected
     */
    protected factory?: F;

    /**
     * The states to be called when constructing the attributes.
     *
     * @protected
     */
    protected states: string[] = [];

    /**
     * The relation factories set by the with() method.
     *
     * @protected
     */
    protected relations: Record<string, FactoryBuilder<Model>> = {};

    public constructor(modelConstructor: new (attributes?: Attributes<T>) => T) {
        this.model = new modelConstructor;
    }

    /**
     * Set the states to be applied.
     * States are applied in the order they appear in the argument.
     *
     * @param {string|string[]} states
     *
     * @return {this}
     */
    public state(states: MaybeArray<State<F> | string>): this;
    public state(states: MaybeArray<string>): this {
        this.states = Array.isArray(states) ? [...new Set(states)] : [states];

        return this;
    }

    /**
     * Override the number of models required.
     *
     * @param {number} amount
     *
     * @return {this}
     */
    public times(amount: number): this {
        if (amount < 1) {
            throw new InvalidArgumentException('\'amount\' expected to be higher than 0.');
        }

        this.amount = Math.round(amount);

        return this;
    }

    /**
     * Get all the attributes in an object format.
     *
     * @param {object=} attributes
     */
    public raw(attributes?: SimpleAttributes<T>): Attributes<T> | Collection<Attributes<T>> {
        return this.addRelations(this.rawAttributes(attributes), 'raw') as Attributes<T> | Collection<Attributes<T>>;
    }

    /**
     * Get all the attributes in an object format
     * while ensuring only a single object is returned.
     *
     * @param {object=} attributes
     */
    public rawOne(attributes?: SimpleAttributes<T>): Attributes<T> {
        return this.times(1).raw(attributes) as Attributes<T>;
    }

    /**
     * Get all the attributes in an object format
     * while ensuring that always a Collection is returned.
     *
     * @param {object=} attributes
     */
    public rawMany(attributes?: SimpleAttributes<T>): Collection<Attributes<T>> {
        const rawAttributes = this.raw(attributes);

        if (!(rawAttributes instanceof Collection)) {
            return new Collection<Attributes<T>>(rawAttributes);
        }

        return rawAttributes;
    }

    /**
     * Create a model or model collection.
     *
     * @param {object=} attributes
     *
     * @return {Model|ModelCollection<Model>}
     */
    public make(attributes?: Attributes<T>): ModelCollection<T> | T {
        const modelOrCollection = this.compileRaw(attributes);

        const factory = this.getFactory();

        if ('afterMaking' in factory && factory.afterMaking instanceof Function) {
            factory.afterMaking(modelOrCollection);
        }

        return this.addRelations(modelOrCollection, 'make') as ModelCollection<T> | T;
    }

    /**
     * Create a model.
     *
     * @param {object=} attributes
     *
     * @return {Model}
     */
    public makeOne(attributes?: Attributes<T>): T {
        return this.times(1).make(attributes) as T;
    }

    /**
     * Create a model collection.
     *
     * @param {object=} attributes
     *
     * @return {ModelCollection}
     */
    public makeMany(attributes?: Attributes<T>): ModelCollection<T> {
        const models = this.make(attributes);

        if (!(models instanceof ModelCollection)) {
            return new ModelCollection(models);
        }

        return models;
    }

    /**
     * Create a model or model collection completed with timestamps and id if required.
     *
     * @param {object=} attributes
     *
     * @return {Model|ModelCollection<Model>}
     */
    public create(attributes?: Attributes<T>): ModelCollection<T> | T {
        const modelOrCollection = this.compileRaw(attributes);

        if (ModelCollection.isModelCollection<T>(modelOrCollection)) {
            modelOrCollection.forEach(model => {
                this.addPersistenceAttributes(model);
            });
        } else {
            this.addPersistenceAttributes(modelOrCollection);
        }

        const factory = this.getFactory();

        if ('afterCreating' in factory && factory.afterCreating instanceof Function) {
            factory.afterCreating(modelOrCollection);
        }

        return this.addRelations(modelOrCollection, 'create') as ModelCollection<T> | T;
    }

    /**
     * Create a model completed with timestamps and id if required.
     *
     * @param {object=} attributes
     *
     * @return {Model}
     */
    public createOne(attributes?: Attributes<T>): T {
        return this.times(1).create(attributes) as T;
    }

    /**
     * Create a model collection completed with timestamps and id if required.
     *
     * @param {object=} attributes
     *
     * @return {ModelCollection<Model>}
     */
    public createMany(attributes?: Attributes<T>): ModelCollection<T> {
        const models = this.create(attributes);

        if (!(models instanceof ModelCollection)) {
            return new ModelCollection(models);
        }

        return models;
    }

    /**
     * Add the relation to the builder fluently.
     *
     * @param {FactoryBuilder} relation - The builder instance to be called.
     * @param {string=} relationName - The optional relation name.
     *
     * @return {this}
     */
    public with<M extends Model>(relation: FactoryBuilder<M> | (new () => M), relationName?: string): this {
        if (relation instanceof FactoryBuilder) {
            relationName = relationName ?? relation.model.getName().toLowerCase();
        } else if (isUserLandClass<typeof Model>(relation)) {
            relationName = relationName ?? (new relation).getName().toLowerCase();
            relation = relation.factory();
        } else {
            throw new InvalidArgumentException(
                'Argument for the \'with\' method expected to be an instance of '
                + FactoryBuilder.name + ' or a Model constructor.'
            );
        }

        // @ts-expect-error
        if (!this.model.relationDefined(relationName)) {
            relationName = plural(relationName);

            // @ts-expect-error
            if (!this.model.relationDefined(relationName)) {
                throw new InvalidArgumentException(
                    '\'' + this.model.getName()
                    + '\' doesn\'t have the \''
                    + singular(relationName) + '\' or \'' + relationName +
                    '\' relationship defined.'
                );
            }
        }

        this.relations[relationName] = relation as unknown as FactoryBuilder<Model>;

        return this;
    }

    /**
     * Add the relations if any onto the given data.
     *
     * @param {object|Model|Collection|ModelCollection} data - the object to add the relation to
     * @param {'raw'|'make'|'create'} method - the method the relation should be created with
     *
     * @protected
     *
     * @return {object|Model|Collection|ModelCollection}
     */
    protected addRelations(
        data: Attributes | Collection<Attributes> | ModelCollection<T> | T,
        method: 'create' | 'make' | 'raw'
    ): Attributes | Collection<Attributes> | ModelCollection<T> | T {
        if (Object.keys(this.relations).length) {
            // if collection, be it attributes or model collection
            if (Collection.isCollection<Attributes | T>(data)) {
                // for each recursively call this method
                data = data.map(
                    (entry: Attributes | T) => this.addRelations(entry, method)
                ) as Collection<Attributes> | ModelCollection<T>;
            } else {
                Object.keys(this.relations).forEach(relation => {
                    const relationValue = this.relations[relation]![method]();

                    if (method === 'raw') {
                        // add relation to the model to check the relationValue is a valid value for the relation type
                        (new (this.model.constructor as typeof Model)).addRelation(relation, relationValue);
                        (data as Attributes)[relation] = relationValue;
                    } else {
                        (data as Model).addRelation(relation, relationValue);
                    }
                });
            }
        }

        return data;
    }

    /**
     * Add the attributes that indicate that the model exists.
     *
     * @param {Model} model
     *
     * @private
     *
     * @return {Model}
     */
    private addPersistenceAttributes(model: T): T {
        if (!model.getKey()) {
            model.setAttribute(model.getKeyName(), this.getKey());
        }

        if (model.usesTimestamps()) {
            if (!model.getAttribute(model.getCreatedAtName())) {
                model.setAttribute(model.getCreatedAtName(), new Date().toISOString());
            }

            if (!model.getAttribute(model.getUpdatedAtName())) {
                model.setAttribute(model.getUpdatedAtName(), new Date().toISOString());
            }
        }

        // @ts-expect-error
        model.setLastSyncedAt();

        return model.syncOriginal();
    }

    /**
     * Create a model or model collection instance from the raw attributes.
     *
     * @param {object=} attributes
     *
     * @protected
     *
     * @return {Model|ModelCollection<Model>}
     */
    protected compileRaw(attributes?: Attributes<T>): ModelCollection<T> | T {
        const compiledAttributes = this.rawAttributes(attributes);

        if (Collection.isCollection<Attributes>(compiledAttributes)) {
            const models: T[] = [];

            compiledAttributes.forEach(compiledAttribute => {
                const model = new (this.model.constructor as typeof Model) as T;
                models.push(model.forceFill(compiledAttribute).syncOriginal());
            });

            return new ModelCollection(models);
        } else {
            const model = new (this.model.constructor as typeof Model) as T;
            return model.forceFill(compiledAttributes).syncOriginal();
        }
    }

    /**
     * Compile and return all attributes.
     *
     * @param {object=} attributes
     *
     * @protected
     *
     * @return {object|object[]}
     */
    protected rawAttributes(attributes: Attributes = {}): Attributes | Collection<Attributes> {
        const factory = this.getFactory();

        const compiledAttributeArray: Attributes[] = [];
        let times = 0;

        while (times !== this.amount) {
            times++;

            let compiledAttributes = this.resolveAttributes(factory.definition(this.model, times));

            this.states?.forEach(state => {
                if (!(state in factory)) {
                    throw new InvalidOffsetException(
                        '\'' + state + '\' is not defined on the \'' + factory.getClassName() + '\' factory class.'
                    );
                }

                if (!(factory[state] instanceof Function)) {
                    throw new InvalidOffsetException(
                        '\'' + state + '\' is not a method on the \'' + factory.getClassName() + '\' factory class.'
                    );
                }

                const attributesFromState = factory[state]!(this.model, times);

                if (!attributesFromState || typeof attributesFromState !== 'object') {
                    throw new TypeError(
                        '\'' + state + '\' is not returning an object on \''
                        + factory.getClassName() + '\' factory class.'
                    );
                }

                compiledAttributes = this.resolveAttributes(attributesFromState as Attributes, compiledAttributes);
            });

            if (this.model.usesTimestamps()) {
                attributes[this.model.getCreatedAtName()] = attributes[this.model.getCreatedAtName()] ?? null;
                attributes[this.model.getUpdatedAtName()] = attributes[this.model.getUpdatedAtName()] ?? null;
            }

            if (this.model.usesSoftDeletes()) {
                attributes[this.model.getDeletedAtName()] = attributes[this.model.getDeletedAtName()] ?? null;
            }

            compiledAttributeArray.push(this.resolveAttributes(attributes, compiledAttributes));
        }

        if (!compiledAttributeArray.length) {
            return {};
        }

        return compiledAttributeArray.length === 1
            ? compiledAttributeArray[0]!
            : new Collection(compiledAttributeArray);
    }

    /**
     * Resolve the attributes in order.
     *
     * @link {https://stackoverflow.com/a/5525820}
     *
     * @param {object} attributes
     * @param {object} previouslyResolvedAttributes
     *
     * @private
     *
     * @return {object}
     */
    private resolveAttributes(attributes: Attributes, previouslyResolvedAttributes: Attributes = {}): Attributes {
        Object.getOwnPropertyNames(attributes)
            .forEach(key => {
                previouslyResolvedAttributes[key] = attributes[key] instanceof Function
                    ? (attributes[key] as CallableFunction)(previouslyResolvedAttributes)
                    : attributes[key];
            });

        return previouslyResolvedAttributes;
    }

    /**
     * Get the factory instance from the model.
     *
     * @protected
     *
     * @return {Factory}
     */
    protected getFactory(): F {
        if (this.factory) {
            return this.factory;
        }

        if (!('factory' in this.model) || !(this.model.factory instanceof Function)) {
            throw new InvalidOffsetException(
                'The method factory() is either not defined or not and instance of Function on the \''
                + this.model.getName() + '\' class.'
            );
        }

        const factory = this.model.factory() as F;

        if (!(factory instanceof Factory)) {
            throw new TypeError(
                'Invalid return type defined on the factory() method on the \'' + this.model.getName() + '\' class.'
                + ' Expected \'' + Factory.name + '\', got \'' + typeof factory + '\'.'
            );
        }

        return this.factory = factory;
    }

    /**
     * Get a unique id based on the model name.
     *
     * @protected
     *
     * @return {string|number}
     */
    protected getKey(): number | string {
        const config: GlobalConfig<Configuration & Record<'_lastIds', Record<string, number>>> = new GlobalConfig();

        const _lastIds = config.get('_lastIds', {});
        const modelName = this.model.getName();

        // update or create entry for the model.
        if (!_lastIds[modelName]) {
            _lastIds[modelName] = 1;
            config.set('_lastIds', _lastIds);
        } else {
            _lastIds[modelName]++;
            config.set('_lastIds', _lastIds);
        }

        // @ts-expect-error
        return this.model.keyType === 'string' ? `unique-id-${_lastIds[modelName]!}` : _lastIds[modelName]!;
    }
}
