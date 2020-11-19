import type Jsonable from '../../Contracts/Jsonable';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import GuardsAttributes from './GuardsAttributes';
import type HasRelations from './HasRelations';

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
    protected attributes: Record<string, any> = {};

    /**
     * The attribute's original state.
     *
     * @protected
     *
     * @type {object}
     */
    protected original: Record<string, any> = {};

    /**
     * Create a new instance.
     *
     * @param {object} attributes
     *
     * @protected
     *
     * @return {this}
     */
    constructor(attributes?: Record<string, any>) {
        super();

        if (attributes instanceof HasAttributes) {
            return this.constructor(attributes.attributes);
        }

        if (attributes && Object.keys(attributes)) {
            Object.keys(attributes).forEach(name => {
                if (name === 'prototype' || name === 'constructor' || name === 'length') {
                    return;
                }

                // cast name to the expected format
                const adjustedName = String.prototype[this.attributeCasing].call(name);

                if (!!attributes[name]
                    && typeof attributes[name] === 'object'
                    && (this as unknown as HasRelations).relationDefined(adjustedName)
                ) {
                    (this as unknown as HasRelations).addRelation(adjustedName, attributes[name]);
                }

                // set up accessors and mutators
                const descriptor: PropertyDescriptor = {};
                descriptor.get = () => this.getAttribute(adjustedName);
                descriptor.set = (newValue) => this.setAttribute(adjustedName, newValue);

                Object.defineProperty(this, adjustedName, descriptor);
            });

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
                return (this[`get${key.title()}Attribute`] as CallableFunction)(this.attributes[key]);
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

            return  this[key] instanceof Function ? (this[key] as CallableFunction)() : this[key];
        }

        return defaultVal;
    }

    /**
     * Get all of the current attributes on the model.
     *
     * @return {object}
     */
    public getAttributes(): Record<string, any> {
        const result: Record<string, any> = {};

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
            (this[`set${key.title()}Attribute`] as CallableFunction)(value);

            return this;
        }

        if (!!value && value instanceof Object && (this as unknown as HasRelations).relationDefined(key)) {
            (this as unknown as HasRelations).addRelation(key, value);

            return this;
        }

        this.attributes[key] = value;

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
        return `set${key.title()}Attribute` in this && this[`set${key.title()}Attribute`] instanceof Function;
    }

    /**
     * Determine if a get accessor exists for an attribute.
     *
     * @param {string} key
     *
     * @return {boolean}
     */
    public hasGetAccessor(key: string): boolean {
        return `get${key.title()}Attribute` in this && this[`get${key.title()}Attribute`] instanceof Function;
    }

    /**
     * Fill the model with an array of attributes.
     *
     * @param {object} attributes
     *
     * @return {this}
     */
    public fill(attributes: Record<string, any>): this {
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
    public forceFill(attributes: Record<string, any>): this {
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
    public getOriginal(key?: string, defaultValue?: any): Record<string, any> | any {
        if (key) {
            return this.original[key] ? this.castAttribute(key, this.original[key]) : defaultValue;
        }

        const result: Record<string, any> = {};

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
    public getRawOriginal(key?: string, defaultValue?: any): Record<string, any> | any {
        if (key) {
            return this.original[key] ?? defaultValue;
        }

        if (!Object.keys(this.original).length) {
            return defaultValue;
        }

        return this.original;
    }

    /**
     * Get the attributes that were changed.
     *
     * @param {string|undefined} key
     *
     * @return {object|null}
     */
    public getChanges(key?: string): Record<string, any> | null {
        if (key && this.attributes[key]) {
            return !isEqual(this.getRawOriginal(key), this.attributes[key])
                ? { [key]: this.castAttribute(key, this.attributes[key]) }
                : null;
        }

        const result: Record<string, any> = {};

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
    public only(attributes: string[]): Record<string, any> {
        const result: Record<string, any> = {};

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
     * @param {string[]} attributes
     *
     * @return {object}
     */
    public except(attributes: string[]): Record<string, any> {
        const result: Record<string, any> = {};

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
        return JSON.stringify(this.getAttributes());
    }
}
