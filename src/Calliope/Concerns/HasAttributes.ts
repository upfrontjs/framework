import type Jsonable from '../../Contracts/Jsonable';
import { isEqual, cloneDeep } from 'lodash';
import GuardsAttributes from './GuardsAttributes';
import type HasRelations from './HasRelations';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';
import { isObjectLiteral } from '../../Support/function';
import Collection from '../../Support/Collection';
import { camel, pascal, snake } from '../../Support/string';
import type { KeysNotMatching, MaybeArray } from '../../Support/type';

// eslint-disable-next-line max-len
type InternalProperties = 'attributeCasing' | 'attributeCasts' | 'attributes' | 'casts' | 'endpoint' | 'exists' | 'fillable' | 'fillableAttributes' | 'guarded' | 'guardedAttributes' | 'hasOneOrManyParentKeyName' | 'loading' | 'mutatedEndpoint' | 'original' | 'primaryKey' | 'relationMethodPrefix' | 'relations' | 'requestCount' | 'serverAttributeCasing';

/**
 * All keys of the object except where the value is a method
 * or it's a property defined on internally.
 *
 * Results in a union of keys.
 */
export type AttributeKeys<T> = Exclude<KeysNotMatching<T, CallableFunction>, InternalProperties>;

/**
 * The attributes the model is handling.
 */
export type Attributes<T extends HasAttributes = HasAttributes> = Record<AttributeKeys<T> | string, unknown>;
// todo - update type to specify value type so getAttributes().myKey will correctly typehint and not be unknown
// export type Attributes<
//     M extends HasAttributes = HasAttributes
//     // string index falls back to the model index signature
// > = { [P in keyof M extends AttributeKeys<M> ? keyof M : never]: M[P] };
//
//
// export type KeysNotMatching<T, V> = KeysNotMatching2<keyof T, T, V>;
// // Using this intermediate type to force distribution.
// type KeysNotMatching2<Keys extends keyof T, T, V> = Keys extends unknown ? KeyIsAttribute<Keys, T, V> : never;
// type KeyIsAttribute<Key extends keyof T, T, V> = T[Key] extends V ? never : Key;

export default class HasAttributes extends GuardsAttributes implements Jsonable, Iterable<any> {
    /**
     * The model attribute.
     */
    [key: string]: unknown;

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
    // this.relations, and it wouldn't
    // be set otherwise.
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
            const allProperties = attributes.getRawAttributes();

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
            yield [cloneDeep(properties[keys[i]!]), keys[i]];
        }
    }

    /**
     * Utility to cast the given string to the attributeCasing's case.
     *
     * @param {string} key
     *
     * @see attributeCasing
     *
     * @protected
     *
     * @return {string}
     */
    protected setStringCase(key: AttributeKeys<this> | string): string
    protected setStringCase(key: string): string {
        return this.attributeCasing === 'camel' ? camel(key) : snake(key);
    }

    /**
     * Get an attribute from the model.
     *
     * @param {string} key
     * @param {any=} defaultValue
     *
     * @return {any}
     */
    public getAttribute<
        K extends AttributeKeys<this> | string,
        T extends K extends AttributeKeys<this> ? this[K] : unknown = K extends AttributeKeys<this> ? this[K] : unknown
    >(key: K, defaultValue?: T): T
    public getAttribute(key: string, defaultValue?: unknown): unknown {
        // If attribute exists
        if (key in this.attributes) {
            // If it has an accessor, call it.
            if (this.hasGetAccessor(key)) {
                return (this[`get${pascal(key)}Attribute`] as CallableFunction)(cloneDeep(this.attributes[key]));
            }

            return this.castAttribute(key, this.attributes[key]);
        }

        if ((this as unknown as HasRelations).relationLoaded(key)) {
            return (this as unknown as HasRelations).getRelation(key);
        }

        // If it's a method or otherwise attribute
        if (key in this) {
            const value = Reflect.getOwnPropertyDescriptor(this, key)?.value;

            // returning the method or the result of the method would be unexpected
            if (value === undefined || value instanceof Function) {
                return defaultValue;
            }

            return value;
        }

        return defaultValue;
    }

    /**
     * Get all the attributes on the model.
     *
     * @return {object}
     */
    public getAttributes(): Attributes<this>
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
    public getRawAttributes(): Attributes<this>
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
    public setAttribute<K extends AttributeKeys<this>, T extends this[K]>(key: K, value: T): this
    public setAttribute<K extends string, T>(key: K, value: T): this
    public setAttribute<
        K extends AttributeKeys<this> | string,
        T extends K extends AttributeKeys<this> ? this[K] : unknown = K extends AttributeKeys<this> ? this[K] : unknown
    >(key: K, value: T): this
    public setAttribute(key: string, value: unknown): this {
        if (this.hasSetMutator(key)) {
            (this[`set${pascal(key)}Attribute`] as CallableFunction)(cloneDeep(value));

            this.createDescriptor(key);
            return this;
        }

        if (this.hasCast(key)) {
            this.attributes[key] = this.castAttribute(key, value, 'set');

            this.createDescriptor(key);
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
                value as Collection<Attributes> | MaybeArray<Attributes> | Model | ModelCollection<Model>
            );

            return this;
        }

        this.attributes[key] = cloneDeep(value);
        this.createDescriptor(key);

        return this;
    }

    /**
     * Create descriptors for the given key(s) therefore allowing magic access.
     *
     * @param {string|string[]} keys
     *
     * @return {this}
     */
    protected createDescriptor(keys: MaybeArray<AttributeKeys<this> | string>): this
    protected createDescriptor(keys: MaybeArray<string>): this {
        keys = Array.isArray(keys) ? keys : [keys];

        keys.forEach(key => {
            if (!Object.getOwnPropertyDescriptor(this, key)) {
                // set up getters and setters
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
    public deleteAttribute(key: AttributeKeys<this> | string): this
    public deleteAttribute(key: string): this {
        delete this.attributes[key];

        // @ts-expect-error
        if ((this as unknown as HasRelations).relationDefined(key)) {
            (this as unknown as HasRelations).removeRelation(key);
        } else if (Object.getOwnPropertyDescriptor(this, key) && !(this[key] instanceof Function)) {
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
    protected hasSetMutator(key: AttributeKeys<this> | string): boolean
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
    protected hasGetAccessor(key: AttributeKeys<this> | string): boolean
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
    public fill(attributes: Attributes | Attributes<this>): this
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
    public forceFill(attributes: Attributes | Attributes<this>): this
    public forceFill(attributes: Attributes): this {
        Object.keys(attributes).forEach(name => {
            this.setAttribute(this.setStringCase(name), attributes[name] as any);
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
    public syncOriginal(keys?: MaybeArray<AttributeKeys<this> | string>): this
    public syncOriginal(keys?: MaybeArray<string>): this {
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
    public getOriginal(): Attributes<this>
    public getOriginal<
        K extends AttributeKeys<this> | string,
        T extends K extends AttributeKeys<this> ? this[K] : unknown
    >(key?: K, defaultValue?: T): T
    public getOriginal(key?: string, defaultValue?: unknown): unknown {
        const getOriginalValue = (attributeKey: string) => {
            if (this.hasGetAccessor(attributeKey)) {
                return (this[`get${pascal(attributeKey)}Attribute`] as CallableFunction)(
                    cloneDeep(this.original[attributeKey])
                );
            }

            return this.castAttribute(attributeKey, this.original[attributeKey]);
        };

        if (key) {
            return this.original.hasOwnProperty(key) ? getOriginalValue(key) : defaultValue;
        }

        const result: Attributes = {};

        Object.keys(this.original).forEach(name => result[name] = getOriginalValue(name));

        return result;
    }

    /**
     * Get the original attributes without casting.
     *
     * @param {string=} key
     * @param {any=} defaultValue
     *
     * @return {any}
     */
    public getRawOriginal(): Attributes<this>
    public getRawOriginal<
        K extends AttributeKeys<this> | string,
        T extends K extends AttributeKeys<this> ? this[K] : unknown>(key?: K, defaultValue?: T): T
    public getRawOriginal<T>(key?: string, defaultValue?: T): T
    public getRawOriginal(key?: string, defaultValue?: unknown): unknown {
        if (key) {
            return this.original.hasOwnProperty(key) ? cloneDeep(this.original[key]) : defaultValue;
        }

        return cloneDeep(this.original);
    }

    /**
     * Get the attributes that were changed.
     *
     * @param {string=} key
     *
     * @return {object}
     */
    public getChanges(key?: AttributeKeys<this> | string): Attributes
    public getChanges(key?: string): Attributes {
        if (key) {
            if (isEqual(this.getRawOriginal(key), this.attributes[key])) {
                return {};
            }

            return {
                [key]: this.castAttribute(key, this.attributes[key])
            };
        }

        const result: Attributes = {};

        Object.keys(this.attributes).forEach(name => {
            if (!isEqual(this.getRawOriginal(name), this.attributes[name])) {
                result[name] = this.castAttribute(name, this.attributes[name]);
            }
        });

        return result;
    }

    /**
     * Get the deleted attributes if any.
     *
     * @param {string=} key
     *
     * @return {object}
     */
    public getDeletedAttributes(key?: AttributeKeys<this> | string): Attributes
    public getDeletedAttributes(key?: string): Attributes {
        if (key) {
            if (key in this.original) {
                if (key in this.attributes) {
                    return {};
                } else {
                    return {
                        [key]: this.castAttribute(key, this.original[key])
                    };
                }
            }

            return {};
        }

        const rawAttributes = this.getRawAttributes();
        const deleted: Attributes = {};

        Object.keys(this.getRawOriginal()).forEach(name => {
            if (!(name in rawAttributes)) {
                deleted[name] = this.castAttribute(name, this.original[name]);
            }
        });

        return deleted;
    }

    /**
     * Get the new attributes if any.
     *
     * @param {string=} key
     *
     * @return {object}
     */
    public getNewAttributes(key?: AttributeKeys<this> | string): Attributes
    public getNewAttributes(key?: string): Attributes {
        if (key) {
            if (key in this.attributes) {
                if (key in this.original) {
                    return {};
                } else {
                    return {
                        [key]: this.castAttribute(key, this.attributes[key])
                    };
                }
            }

            return {};
        }

        const rawOriginalAttributes = this.getRawOriginal<Attributes>();
        const added: Attributes = {};

        Object.keys(this.getRawAttributes()).forEach(name => {
            if (!(name in rawOriginalAttributes)) {
                added[name] = this.castAttribute(name, this.attributes[name]);
            }
        });

        return added;
    }

    /**
     * Determine whether the given attribute has changed
     * or attributes has been added or deleted.
     *
     * @param {key|undefined} key
     *
     * @return {boolean}
     */
    public hasChanges(key?: AttributeKeys<this> | string): boolean
    public hasChanges(key?: string): boolean {
        return !!Object.keys(this.getChanges(key)).length
            || !!Object.keys(this.getDeletedAttributes(key)).length
            || !!Object.keys(this.getNewAttributes(key)).length;
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
    public isDirty(key?: AttributeKeys<this> | string): boolean
    public isDirty(key?: string): boolean {
        return this.hasChanges(key);
    }

    /**
     * Determine whether given or any attributes was changed.
     *
     * @param {string|undefined} key
     */
    public isClean(key?: AttributeKeys<this> | string): boolean
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
    public only<K extends AttributeKeys<this> | string>(attributes: K): Pick<Attributes<this>, K> & Record<K, this[K]>
    public only(attributes: MaybeArray<string>): Attributes
    public only(attributes: MaybeArray<string>): Attributes {
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
    public except<K extends AttributeKeys<this> | string>(attributes: K):
    Record<Exclude<AttributeKeys<this>, K>, this[Exclude<AttributeKeys<this>, K>]>
    & Record<K, K extends AttributeKeys<this> ? never : unknown>
    public except(attributes: MaybeArray<string>): Attributes
    public except(attributes: MaybeArray<string>): Attributes {
        const result: Attributes = {};

        attributes = Array.isArray(attributes) ? attributes : [attributes];

        this.getAttributeKeys()
            .filter(name => !attributes.includes(name))
            .forEach(name => {
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
        const objectRepresentation = this.getAttributes() as Attributes;

        const relations = (this as unknown as HasRelations).getRelations();

        Object.keys(relations).forEach(relation =>
            objectRepresentation[relation] = JSON.parse(relations[relation]!.toJson()));

        return JSON.stringify(objectRepresentation);
    }
}
