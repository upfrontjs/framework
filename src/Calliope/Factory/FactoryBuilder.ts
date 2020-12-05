import type Model from '../Model';
import type { Attributes } from '../Concerns/HasAttributes';
import ModelCollection from '../ModelCollection';
import Factory from './Factory';
import InvalidOffsetException from '../../Exceptions/InvalidOffsetException';
import Config from '../../Support/Config';
import Collection from '../../Support/Collection';

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
    protected model: T;

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

    constructor(modelConstructor: new (attributes?: Attributes) => T) {
        this.model = new modelConstructor;
    }

    // todo - chancejs

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

        return modelOrCollection;
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

        const addAttributes = (model: T) => {
            if (model.usesTimestamps()) {
                if (!model.getAttribute(model.getCreatedAtColumn()[model.attributeCasing]())) {
                    model.setAttribute(model.getCreatedAtColumn()[model.attributeCasing](), new Date().toISOString());
                }

                if (!model.getAttribute(model.getUpdatedAtColumn()[model.attributeCasing]())) {
                    model.setAttribute(model.getUpdatedAtColumn()[model.attributeCasing](), new Date().toISOString());
                }
            }

            if (!model.getKey()) {
                model.setAttribute(model.getKeyName(), this.getKey());
            }

            model.syncOriginal();
        };

        if (ModelCollection.isModelCollection(modelOrCollection)) {
            modelOrCollection.forEach((model: T) => addAttributes(model));

            return modelOrCollection;
        }

        addAttributes(modelOrCollection as T);

        const factory = this.getFactory();

        if ('afterCreating' in factory && factory.afterCreating instanceof Function) {
            factory.afterCreating(modelOrCollection);
        }

        return modelOrCollection;
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
        const compiledAttributes = this.raw(attributes);

        if (Collection.isCollection(compiledAttributes)) {
            const models: T[] = [];

            compiledAttributes.forEach(attributes => {
                models.push(new (<typeof Model> this.model.constructor)(attributes as Attributes) as T);
            });

            return new ModelCollection(models);
        } else {
            return new (<typeof Model> this.model.constructor)(compiledAttributes as Attributes) as T;
        }
    }

    /**
     * Compile and return all attributes.
     *
     * @param {object=} attributes
     *
     * @return {object|object[]}
     */
    public raw(attributes: Attributes = {}): Attributes | Collection<Attributes> {
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
    private resolveAttributes(attributes: Attributes, previouslyResolvedAttributes = {}): Attributes {
        Object.keys(attributes).forEach(key => {
            if (attributes[key] instanceof Function) {
                attributes[key] = (attributes[key] as CallableFunction)(previouslyResolvedAttributes);
            }
        });

        return Object.assign(previouslyResolvedAttributes, attributes);
    }

    // todo has/for (polymorphic too)

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
