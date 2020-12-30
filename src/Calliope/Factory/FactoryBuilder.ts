import type Model from '../Model';
import type { Attributes } from '../Concerns/HasAttributes';
import ModelCollection from '../ModelCollection';
import Factory from './Factory';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import Config from '../../Support/Config';
import Collection from '../../Support/Collection';
import InvalidArgumentException from '../../Exceptions/InvalidArgumentException';

export default class FactoryBuilder<T extends Model> {
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
    protected factory: Factory<T> | undefined;

    /**
     * The states to be called when constructing the attributes.
     *
     * @protected
     */
    protected states: string[] | undefined;

    /**
     * The relation factories set by the with() method.
     *
     * @protected
     */
    protected relations: Record<string, FactoryBuilder<Model>> = {};

    constructor(modelConstructor: new (attributes?: Attributes) => T) {
        this.model = new modelConstructor;
    }

    /**
     * Set the states to be applied.
     *
     * @param {string|string[]} states
     *
     * @return {this}
     */
    public state(states: string|string[]): this {
        this.states = Array.isArray(states) ? states : [states];

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
        this.amount = amount;

        return this;
    }

    /**
     * Get all the attributes in an object format.
     *
     * @param {object} attributes
     */
    public raw(attributes: Attributes = {}): Attributes | Collection<Attributes> {
        return this.addRelations(this.rawAttributes(attributes), 'raw') as Attributes | Collection<Attributes>;
    }

    /**
     * Create a model or model collection.
     *
     * @param {object=} attributes
     *
     * @return {Model|ModelCollection<Model>}
     */
    public make(attributes?: Attributes): T|ModelCollection<T> {
        const modelOrCollection = this.compileRaw(attributes);

        const factory = this.getFactory();

        if ('afterMaking' in factory && factory.afterMaking instanceof Function) {
            factory.afterMaking(modelOrCollection);
        }

        return this.addRelations(modelOrCollection, 'make') as T|ModelCollection<T>;
    }

    /**
     * Create a model or model collection completed with timestamps and id if required.
     *
     * @param {object=} attributes
     *
     * @return {Model|ModelCollection<Model>}
     */
    public create(attributes?: Attributes): T|ModelCollection<T> {
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

        return this.addRelations(modelOrCollection, 'create') as T|ModelCollection<T>;
    }

    /**
     * Add the relation to the builder fluently.
     *
     * @param {FactoryBuilder} factoryBuilder - The builder instance to be called.
     * @param {string=} relation - The optional relation name.
     *
     * @return {this}
     */
    public with(factoryBuilder: FactoryBuilder<Model>, relation?: string): this {
        relation = relation ?? factoryBuilder.model.getName().toLowerCase();

        // @ts-expect-error
        if (!this.model.relationDefined(relation)) {
            relation = relation.plural();

            // @ts-expect-error
            if (!this.model.relationDefined(relation)) {
                throw new InvalidArgumentException(
                    '\'' + this.model.getName()
                    + '\' doesn\'t have the \''
                    + relation.singular() + '\' or \'' + relation +
                    '\' relationship defined.'
                );
            }
        }

        this.relations[relation] = factoryBuilder;

        return this;
    }

    /**
     * Add the relations if any onto the given data.
     *
     * @param {object|Model|Collection|ModelCollection} data
     * @param {'raw'|'make'|'create'} method
     *
     * @protected
     *
     * @return {object|Model|Collection|ModelCollection}
     */
    protected addRelations(
        data: Attributes|Collection<Attributes>|T|ModelCollection<T>,
        method: 'raw'|'make'|'create'
    ): Attributes|Collection<Attributes>|T|ModelCollection<T> {
        if (Object.keys(this.relations).length) {
            // if collection, be it attributes or model collection
            if (Collection.isCollection<T|Attributes>(data)) {
                // for each recursively call this method
                data = data.map(
                    (entry: Attributes|T) => this.addRelations(entry, method)
                ) as Collection<Attributes>|ModelCollection<T>;
            } else {
                Object.keys(this.relations).forEach(relation => {
                    const relationValue = (this.relations[relation] as FactoryBuilder<Model>)[method]();

                    if (method === 'raw') {
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
            if (!model.getAttribute(model.getCreatedAtColumn())) {
                model.setAttribute(model.getCreatedAtColumn(), new Date().toISOString());
            }

            if (!model.getAttribute(model.getUpdatedAtColumn())) {
                model.setAttribute(model.getUpdatedAtColumn(), new Date().toISOString());
            }
        }

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
    protected compileRaw(attributes?: Attributes): T|ModelCollection<T> {
        const compiledAttributes = this.rawAttributes(attributes);

        if (Collection.isCollection<Attributes>(compiledAttributes)) {
            const models: T[] = [];

            compiledAttributes.forEach(attributes => {
                const model = new (<typeof Model> this.model.constructor) as T;
                models.push(model.forceFill(attributes).syncOriginal());
            });

            return new ModelCollection(models);
        } else {
            const model = new (<typeof Model> this.model.constructor) as T;
            return model.forceFill(compiledAttributes).syncOriginal();
        }
    }

    /**
     * Compile and return all attributes.
     *
     * @param {object=} attributes
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
                        '\'' + state + '\' is not defined on the \'' + factory.getClassName() + '\' class.'
                    );
                }

                if (!(factory[state] instanceof Function)) {
                    throw new InvalidOffsetException(
                        '\'' + state + '\' is not a method on the \'' + factory.getClassName() + '\' class.'
                    );
                }

                const attributesFromState = (factory[state] as CallableFunction)(this.model, times);

                if (!attributesFromState || typeof attributesFromState !== 'object') {
                    throw new TypeError(
                        '\'' + state + '\' is not returning an object on \'' + factory.getClassName() + '\' class.'
                    );
                }

                compiledAttributes = this.resolveAttributes(attributesFromState, compiledAttributes);
            });

            if (this.model.usesTimestamps()) {
                attributes[this.model.getCreatedAtColumn()] = attributes[this.model.getCreatedAtColumn()] ?? null;
                attributes[this.model.getUpdatedAtColumn()] = attributes[this.model.getUpdatedAtColumn()] ?? null;
            }

            if (this.model.usesSoftDeletes()) {
                attributes[this.model.getDeletedAtColumn()] = attributes[this.model.getDeletedAtColumn()] ?? null;
            }

            compiledAttributeArray.push(this.resolveAttributes(attributes, compiledAttributes));
        }

        if (!compiledAttributeArray.length) {
            return {};
        }

        return compiledAttributeArray.length === 1
            ? compiledAttributeArray[0] as Attributes
            : new Collection(compiledAttributeArray);
    }

    /**
     * Resolve the methods in the attributes.
     *
     * @param {object} attributes
     * @param {object} previouslyResolvedAttributes
     *
     * @private
     *
     * @return {object}
     */
    // todo - to functions pass in the partially done data from this iteration
    //  not just the previously resolved attributes
    private resolveAttributes(attributes: Attributes, previouslyResolvedAttributes = {}): Attributes {
        Object.keys(attributes).forEach(key => {
            if (attributes[key] instanceof Function) { // todo - if factory, resolve?
                attributes[key] = (attributes[key] as CallableFunction)(previouslyResolvedAttributes);
            }
        });

        return Object.assign(previouslyResolvedAttributes, attributes);
    }

    /**
     * Get the factory instance from the model.
     *
     * @protected
     *
     * @return {Factory}
     */
    protected getFactory(): Factory<T> {
        if (this.factory) {
            return this.factory;
        }

        if (!('factory' in this.model) || !(this.model.factory instanceof Function)) {
            throw new InvalidOffsetException(
                'The method factory() is either not defined or not and instance of Function on the \''
                + this.model.getName() + '\' class.'
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const factory = this.model.factory();

        if (!(factory instanceof Factory)) {
            throw new TypeError(
                'Invalid return type defined on the factory() method on the \'' + this.model.getName() + '\' class.'
            );
        }

        this.factory = factory;

        return factory;
    }

    /**
     * Get a unique id.
     *
     * @protected
     *
     * @return {string|number}
     */
    protected getKey(): string|number {
        const config = new Config();

        if (this.model.getKeyName() === 'uuid') {
            return String.uuid();
        }

        const lastIds = config.get('lastIds', {}) as Record<string, number>;

        // update or create entry for the model.
        if (!lastIds[this.model.getName()]) {
            lastIds[this.model.getName()] = 1;
            config.set('lastIds', lastIds);
        } else {
            lastIds[this.model.getName()]++;
            config.set('lastIds', lastIds);
        }

        return lastIds[this.model.getName()] as number;
    }
}
