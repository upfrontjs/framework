import type Jsonable from '../../Contracts/Jsonable';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import GuardsAttributes from './GuardsAttributes';
import type HasRelations from './HasRelations';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';
import { isObject } from '../../Support/function';

export type Attributes = Record<string, unknown>;

// todo - make hidden relations/attributes (set the property enumerable to false)
export default class HasAttributes extends GuardsAttributes implements Jsonable {
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
    public readonly attributeCasing: 'camel' | 'snake' = 'camel';

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
    constructor(attributes?: Attributes) {
        super();

        if (attributes instanceof HasAttributes) {
            // if newing up with a constructor, we'll take the attributes
            // in their current state, not the original.
            const allProperties = attributes.attributes;

            if (isObject(attributes['relations'])) {
                Object.assign(allProperties, attributes.relations);
            }

            return this.constructor(allProperties);
        }

        if (isObject(attributes) && Object.keys(attributes).length) {
            this.fill(attributes);
            this.syncOriginal();
        }

        return this;
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
                return (this[`get${key.pascal()}Attribute`] as CallableFunction)(cloneDeep(this.attributes[key]));
            }

            return this.castAttribute(key, this.attributes[key]);
        }

        if ((this as unknown as HasRelations).relationLoaded(key)) {
            return (this as unknown as HasRelations).getRelation(key);
        }

        // If it's a method or otherwise attribute
        if (key in this) {
            // returning the relation here would be unexpected
            if ((this as unknown as HasRelations).relationDefined(key)) {
                return defaultVal;
            }

            return this[key] instanceof Function ? (this[key] as CallableFunction)() : this[key];
        }

        return defaultVal;
    }

    /**
     * Get all of the current attributes on the model.
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
            (this[`set${key.pascal()}Attribute`] as CallableFunction)(value);

            this.createDescriptors(key);
            return this;
        }

        if ((isObject(value) || Array.isArray(value) && value.every(item => isObject(item)))
            && (this as unknown as HasRelations).relationDefined(key)
        ) {
            (this as unknown as HasRelations).addRelation(
                key,
                value as Attributes|Attributes[]|Model|ModelCollection<Model>
            );

            return this;
        }

        this.attributes[key] = value;
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
    createDescriptors(keys: string|string[]): this {
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
    deleteAttribute(key: string): this {
        delete this.attributes[key];

        if (Object.getOwnPropertyDescriptor(this, key) && !(this as unknown as HasRelations).relationDefined(key)) {
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
    public hasSetMutator(key: string): boolean {
        return `set${key.pascal()}Attribute` in this && this[`set${key.pascal()}Attribute`] instanceof Function;
    }

    /**
     * Determine if a get accessor exists for an attribute.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    public hasGetAccessor(key: string): boolean {
        return `get${key.pascal()}Attribute` in this && this[`get${key.pascal()}Attribute`] instanceof Function;
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
            this.setAttribute(name[this.attributeCasing](), attributes[name]);
        });

        return this;
    }

    /**
     * Sync the original attributes with the current.
     *
     * @param {...string?} keys
     *
     * @return {this}
     */
    public syncOriginal(...keys: string[]): this {
        if (keys.length) {
            keys.flat().forEach(key => {
                if (key in this.original) {
                    this.original[key] = cloneDeep(this.attributes[key]);
                }
            });

            return this;
        }

        this.original = cloneDeep(this.attributes);

        return this;
    }

    /**
     * Alias for the syncOriginal method.
     *
     * @return {this}
     *
     * @see HasAttributes.prototype.syncOriginal
     */
    public reset(): this {
        return this.syncOriginal();
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
        if (key) {
            return this.original[key] ? this.castAttribute(key, this.original[key]) : defaultValue;
        }

        const result: Attributes = {};

        Object.keys(this.original).forEach(name => {
            result[name] = this.castAttribute(name, this.original[name]);
        });

        if (!Object.keys(this.original).length) {
            return defaultValue;
        }

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
            return this.original[key] ? cloneDeep(this.original[key]) : defaultValue;
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
    public getChanges(key?: string): Attributes | null {
        if (key && this.attributes[key]) {
            return !isEqual(this.getRawOriginal(key), this.attributes[key])
                ? { [key]: this.castAttribute(key, this.attributes[key]) }
                : null;
        }

        const result: Attributes = {};

        Object.keys(this.attributes).forEach(name => {
            if (!isEqual(this.getRawOriginal(name), this.attributes[name])) {
                result[name] = this.castAttribute(name, this.attributes[name]);
            }
        });

        if (!Object.keys(result).length) {
            return null;
        }

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
    public only(attributes: string[]): Attributes {
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
    public except(attributes: string|string[]): Attributes {
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
        return JSON.stringify(
            Object.assign({}, this.getAttributes(), (this as unknown as HasRelations).getRelations())
        );
    }
}
