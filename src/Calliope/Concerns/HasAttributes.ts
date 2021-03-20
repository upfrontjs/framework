import type Jsonable from '../../Contracts/Jsonable';
import { isEqual, cloneDeep } from 'lodash';
import GuardsAttributes from './GuardsAttributes';
import type HasRelations from './HasRelations';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';
import { isObjectLiteral } from '../../Support/function';
import Collection from '../../Support/Collection';
import { camel, pascal, snake } from '../../Support/string';

export type Attributes = Record<string, unknown>;

export default class HasAttributes extends GuardsAttributes implements Jsonable, Iterable<any> {
    /**
     * Allow a indexing by string.
     */
    [key: string]: any;

    /**
     * Property indicating how attributes and relation names should be casted by default.
     *
     * @type {'snake'|'camel'}
     *
     * @readonly
     */
    public get attributeCasing(): 'camel' | 'snake' {
        return 'camel';
    }

    /**
     * The attributes.
     *
     * @protected
     *
     * @type {object}
     */
    protected attributes: Attributes = {};

    /**
     * The attribute's original state.
     *
     * @protected
     *
     * @type {object}
     */
    protected original: Attributes = {};

    /**
     * The loaded relations for the model.
     *
     * @protected
     */
    // This property placed here because extending classes are
    // not yet constructed therefore when HasAttributes
    // constructs it may ultimately references
    // this.relations, and it wouldn't be
    // set otherwise.
    protected relations: Record<string, (Model | ModelCollection<Model>)> = {};

    /**
     * Create a new instance.
     *
     * @param {object} attributes
     *
     * @protected
     *
     * @return {this}
     */
    public constructor(attributes?: Attributes) {
        super();

        if (attributes instanceof HasAttributes) {
            // if newing up with a constructor, we'll take the attributes
            // in their current state, not the original.
            const allProperties = cloneDeep(attributes.getRawAttributes());

            if (isObjectLiteral(attributes.relations)) {
                Object.assign(allProperties, cloneDeep(attributes.relations));
            }

            attributes = allProperties;
        }

        if (isObjectLiteral(attributes) && Object.keys(attributes).length) {
            this.fill(attributes).syncOriginal();
        }

        return this;
    }

    /**
     * The iterator used for looping over the attributes and relations.
     *
     * @type {Symbol.iterator}
     */
    public *[Symbol.iterator](): Iterator<any> {
        const properties = Object.assign({}, this.attributes, this.relations);
        const keys = Object.keys(properties);

        for (let i = 0; i < keys.length; i++) {
            yield properties[keys[i]!];
        }
    }

    /**
     * Utility to cast the given string to the attributeCasing's case.
     *
     * @param {string} key
     *
     * @protected
     *
     * @return {string}
     */
    protected setStringCase(key: string): string {
        return this.attributeCasing === 'camel' ? camel(key) : snake(key);
    }

    /**
     * Get an attribute from the model.
     *
     * @param {string} key
     * @param {any|undefined} defaultVal
     *
     * @return {any}
     */
    public getAttribute(key: string, defaultVal?: any): any {
        // If attribute exists
        if (key in this.attributes) {
            // If it has an accessor call it.
            if (this.hasGetAccessor(key)) {
                return (this[`get${pascal(key)}Attribute`] as CallableFunction)(cloneDeep(this.attributes[key]));
            }

            return this.castAttribute(key, this.attributes[key], this.getRawAttributes());
        }

        if ((this as unknown as HasRelations).relationLoaded(key)) {
            return (this as unknown as HasRelations).getRelation(key);
        }

        // If it's a method or otherwise attribute
        if (key in this) {
            const value = Reflect.getOwnPropertyDescriptor(this, key)?.value;

            // returning the method or the result of the method would be unexpected
            if (value === undefined || value instanceof Function) {
                return defaultVal;
            }

            return value;
        }

        return defaultVal;
    }

    /**
     * Get all the attributes on the model.
     *
     * @return {object}
     */
    public getAttributes(): Attributes {
        const result: Attributes = {};

        Object.keys(this.attributes).forEach((name: string) => {
            result[name] = this.getAttribute(name);
        });

        return result;
    }

    /**
     * Get all the attributes on the model without casting or accessors.
     *
     * @return {object}
     */
    public getRawAttributes(): Attributes {
        return cloneDeep(this.attributes);
    }

    /**
     * Get available attribute keys.
     *
     * @return {string[]}
     */
    public getAttributeKeys(): string[] {
        return Object.keys(this.attributes);
    }

    /**
     * Set a given attribute on the model.
     *
     * @param {string} key
     * @param {any} value
     *
     * @return {this}
     */
    public setAttribute(key: string, value: unknown): this {
        if (this.hasSetMutator(key)) {
            (this[`set${pascal(key)}Attribute`] as CallableFunction)(cloneDeep(value));

            this.createDescriptors(key);
            return this;
        }

        if (this.hasCast(key)) {
            this.attributes[key] = this.castAttribute(key, value, this.getRawAttributes(), 'set');

            this.createDescriptors(key);
            return this;
        }

        if (
            (isObjectLiteral(value) && !Collection.isCollection(value)
            || (Array.isArray(value) || Collection.isCollection(value)) && value.every(item => isObjectLiteral(item)))
            // @ts-expect-error
            && (this as unknown as HasRelations).relationDefined(key)
        ) {
            (this as unknown as HasRelations).addRelation(
                key,
                value as Attributes | Attributes[] | Collection<Attributes> | Model | ModelCollection<Model>
            );

            return this;
        }

        this.attributes[key] = cloneDeep(value);
        this.createDescriptors(key);

        return this;
    }

    /**
     * Create descriptors for the given key(s) therefore allowing magic access.
     *
     * @param {string|string[]} keys
     *
     * @return {this}
     */
    protected createDescriptors(keys: string[] | string): this {
        keys = Array.isArray(keys) ? keys : [keys];

        keys.forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                // set up accessors and mutators
                const descriptor: PropertyDescriptor = {
                    get: () => this.getAttribute(key),
                    set: (newValue) => this.setAttribute(key, newValue),
                    enumerable: true,
                    configurable: true
                };

                Object.defineProperty(this, key, descriptor);
            }
        });

        return this;
    }

    /**
     * Remove the attribute and its magic access if set.
     *
     * @param {string} key
     *
     * @return {this}
     */
    public deleteAttribute(key: string): this {
        delete this.attributes[key];

        // @ts-expect-error
        if ((this as unknown as HasRelations).relationDefined(key)) {
            (this as unknown as HasRelations).removeRelation(key);
        } else if (Object.getOwnPropertyDescriptor(this, key)) {
            delete this[key];
        }

        return this;
    }

    /**
     * Determine if a set mutator exists for an attribute.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    protected hasSetMutator(key: string): boolean {
        return `set${pascal(key)}Attribute` in this && this[`set${pascal(key)}Attribute`] instanceof Function;
    }

    /**
     * Determine if a get accessor exists for an attribute.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    protected hasGetAccessor(key: string): boolean {
        return `get${pascal(key)}Attribute` in this && this[`get${pascal(key)}Attribute`] instanceof Function;
    }

    /**
     * Fill the model with an array of attributes.
     *
     * @param {object} attributes
     *
     * @return {this}
     */
    public fill(attributes: Attributes): this {
        this.forceFill(this.getFillableFromObject(attributes));

        return this;
    }

    /**
     * Fill the model with an array of attributes. Force mass assignment.
     *
     * @param {object} attributes
     *
     * @return {this}
     */
    public forceFill(attributes: Attributes): this {
        Object.keys(attributes).forEach(name => {
            this.setAttribute(this.setStringCase(name), attributes[name]);
        });

        return this;
    }

    /**
     * Sync the original attributes with the current.
     *
     * @param {string=} keys
     *
     * @return {this}
     */
    public syncOriginal(keys?: string[] | string): this {
        if (keys) {
            keys = Array.isArray(keys) ? keys : [keys];

            keys.flat().forEach(key => {
                if (this.attributes.hasOwnProperty(key)) {
                    this.original[key] = cloneDeep(this.attributes[key]);
                } else {
                    delete this.original[key];
                }
            });

            return this;
        }

        this.original = cloneDeep(this.attributes);

        return this;
    }

    /**
     * Reset the attributes to the original values.
     *
     * @return {this}
     */
    public reset(): this {
        this.attributes = cloneDeep(this.original);

        return this;
    }

    /**
     * Get the original attributes.
     *
     * @param {string} key
     * @param {any} defaultValue
     *
     * @return {any}
     */
    public getOriginal(key?: string, defaultValue?: any): Attributes | any {
        const getOriginalValue = (attributeKey: string, rawAttributes: Attributes) => {
            if (this.hasGetAccessor(attributeKey)) {
                return (this[`get${pascal(attributeKey)}Attribute`] as CallableFunction)(
                    cloneDeep(this.original[attributeKey])
                );
            }

            return this.castAttribute(attributeKey, this.original[attributeKey], rawAttributes);
        };

        if (key) {
            return this.original.hasOwnProperty(key)
                ? getOriginalValue(key, this.getRawAttributes())
                : defaultValue;
        }

        const rawAttributes = this.getRawAttributes();
        const result: Attributes = {};

        Object.keys(this.original).forEach(name => result[name] = getOriginalValue(name, rawAttributes));

        return result;
    }

    /**
     * Get the original attributes without casting.
     *
     * @param {string|undefined} key
     * @param {any} defaultValue
     *
     * @return {any}
     */
    public getRawOriginal(key?: string, defaultValue?: any): Attributes | any {
        if (key) {
            return this.original.hasOwnProperty(key) ? cloneDeep(this.original[key]) : defaultValue;
        }

        if (!Object.keys(this.original).length) {
            return defaultValue;
        }

        return cloneDeep(this.original);
    }

    /**
     * Get the attributes that were changed.
     *
     * @param {string|undefined} key
     *
     * @return {object|null}
     */
    public getChanges(key?: string): Attributes {
        if (key) {
            if (isEqual(this.getRawOriginal(key), this.attributes[key])) {
                return {};
            }
            return {
                [key]: this.castAttribute(key, this.attributes[key], this.getRawAttributes())
            };
        }

        const rawAttributes = this.getRawAttributes();
        const result: Attributes = {};

        Object.keys(this.attributes).forEach(name => {
            if (!isEqual(this.getRawOriginal(name), this.attributes[name])) {
                result[name] = this.castAttribute(name, this.attributes[name], rawAttributes);
            }
        });

        return result;
    }

    /**
     * Determine whether the given or any attributes has changed.
     *
     * @param {key|undefined} key
     *
     * @return {boolean}
     */
    public hasChanges(key?: string): boolean {
        return !!Object.keys(Object(this.getChanges(key))).length;
    }

    /**
     * Alias for the hasChanges method.
     *
     * @see hasChanges
     *
     * @param {string|undefined} key
     *
     * @return {boolean}
     */
    public isDirty(key?: string): boolean {
        return this.hasChanges(key);
    }

    /**
     * Determine whether given or any attributes was changed.
     *
     * @param {string|undefined} key
     */
    public isClean(key?: string): boolean {
        return !this.hasChanges(key);
    }

    /**
     * Get a subset of the model's attributes.
     *
     * @param {string[]} attributes
     *
     * @return {object}
     */
    public only(attributes: string[] | string): Attributes {
        attributes = Array.isArray(attributes) ? attributes : [attributes];
        const result: Attributes = {};

        attributes.forEach((name: string) => {
            if (name in this.attributes) {
                result[name] = this.getAttribute(name);
            }
        });

        return result;
    }

    /**
     * Get all model attributes except the given keys.
     *
     * @param {string|string[]} attributes
     *
     * @return {object}
     */
    public except(attributes: string[] | string): Attributes {
        const result: Attributes = {};

        attributes = Array.isArray(attributes) ? attributes : [attributes];

        this.getAttributeKeys()
            .filter(name => !attributes.includes(name))
            .forEach((name: string) => {
                if (name in this.attributes) {
                    result[name] = this.getAttribute(name);
                }
            });

        return result;
    }

    /**
     * @inheritDoc
     */
    public toJson(): string {
        const objectRepresentation = this.getAttributes();

        const relations = (this as unknown as HasRelations).getRelations();

        Object.keys(relations).forEach((relation) =>
            objectRepresentation[relation] = JSON.parse(relations[relation]!.toJson()));

        return JSON.stringify(objectRepresentation);
    }
}
