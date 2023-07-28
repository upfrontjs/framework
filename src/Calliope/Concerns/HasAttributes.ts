import type Jsonable from '../../Contracts/Jsonable';
import { isEqual, cloneDeep } from 'lodash';
import GuardsAttributes from './GuardsAttributes';
import type HasRelations from './HasRelations';
import type Model from '../Model';
import type ModelCollection from '../ModelCollection';
import isObjectLiteral from '../../Support/function/isObjectLiteral';
import transformKeys from '../../Support/function/transformKeys';
import Collection from '../../Support/Collection';
import camel from '../../Support/string/camel';
import pascal from '../../Support/string/pascal';
import snake from '../../Support/string/snake';
import type { KeysNotMatching, MaybeArray } from '../../Support/type';

// eslint-disable-next-line max-len
type InternalProperties = 'attributeCasing' | 'attributeCasts' | 'attributes' | 'casts' | 'endpoint' | 'exists' | 'fillable' | 'fillableAttributes' | 'guarded' | 'guardedAttributes' | 'hasOneOrManyParentKeyName' | 'loading' | 'mutatedEndpoint' | 'original' | 'primaryKey' | 'relationMethodPrefix' | 'relations' | 'requestCount' | 'serverAttributeCasing';

/**
 * All keys of the model except where the value is a method,
 * or it's a property defined internally.
 *
 * Results in a union of keys.
 */
export type AttributeKeys<T, Ex = CallableFunction> = Exclude<KeysNotMatching<T, Ex>, InternalProperties> | string;

/**
 * All keys of the model except where the value is a method,
 * a relation, or it's a property defined internally.
 *
 * Results in a union of keys.
 */
export type SimpleAttributeKeys<T extends HasAttributes = HasAttributes> =
    AttributeKeys<T, CallableFunction | (Model | ModelCollection<Model> | undefined)>;


/**
 * The attributes the model is handling.
 */
export type Attributes<T extends HasAttributes = HasAttributes> = {
    [K in AttributeKeys<T>]: T[K];
};

/**
 * The attributes the model is handling except relation values.
 */
export type SimpleAttributes<T extends HasAttributes = HasAttributes> = {
    [K in SimpleAttributeKeys<T>]: T[K] extends Model | ModelCollection<Model> ? never : T[K];
};

/**
 * Unwrap the model attributes recursively into attributes or array of attributes.
 */
export type RawAttributes<T extends HasAttributes> = {
    [K in AttributeKeys<T>]: T[K] extends Model
        ? RawAttributes<T[K]>
        : T[K] extends ModelCollection<infer M> ? RawAttributes<M>[] : T[K]
};

export default class HasAttributes extends GuardsAttributes implements Jsonable, Iterable<any> {
    /**
     * The model attribute.
     */
    [key: string]: unknown;

    /**
     * Property indicating how attributes and relation names should be cast by default.
     *
     * @type {'snake'|'camel'}
     *
     * @readonly
     */
    protected get attributeCasing(): 'camel' | 'snake' {
        return 'camel';
    }

    /**
     * Property indicating how attributes and relation names
     * should be cast by default when sent to the server.
     *
     * @type {'snake'|'camel'}
     *
     * @protected
     */
    protected get serverAttributeCasing(): 'camel' | 'snake' {
        return 'snake';
    }

    /**
     * The attributes.
     *
     * @protected
     *
     * @type {object}
     */
    protected attributes: SimpleAttributes = {};

    /**
     * The attribute's original state.
     *
     * @protected
     *
     * @type {object}
     */
    protected original: SimpleAttributes = {};

    /**
     * The iterator used for looping over the attributes and relations.
     *
     * @type {Symbol.iterator}
     */
    public *[Symbol.iterator](): Iterator<any> {
        const properties = Object.assign({}, this.attributes, (this as Model['relations'] & this).relations);
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
    protected setStringCase(key: AttributeKeys<this> | string): string;
    protected setStringCase(key: string): string {
        return this.attributeCasing === 'camel' ? camel(key) : snake(key);
    }

    /**
     * Utility to cast the given string to the serverAttributeCasing's case.
     *
     * @param {string} key
     *
     * @see serverAttributeCasing
     *
     * @protected
     *
     * @return {string}
     */
    protected setServerStringCase(key: AttributeKeys<this> | string): string;
    protected setServerStringCase(key: string): string {
        return this.serverAttributeCasing === 'camel' ? camel(key) : snake(key);
    }

    /**
     * Get an attribute from the model.
     *
     * @param {string} key
     * @param {any=} defaultValue
     *
     * @return {any}
     */
    public getAttribute<K extends AttributeKeys<this> | string, T extends this[K]>(key: K, defaultValue: T): T;
    public getAttribute<
        K extends AttributeKeys<this> | string,
        T extends this[K]
    >(key: K, defaultValue?: T): T | undefined;
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
    public getAttributes(): SimpleAttributes<this>;
    public getAttributes(): SimpleAttributes {
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
    public getRawAttributes(): SimpleAttributes<this>;
    public getRawAttributes(): SimpleAttributes {
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
    public setAttribute<K extends AttributeKeys<this>, T extends this[K]>(key: K, value: T): this;
    public setAttribute<K extends string, T>(key: K, value: T): this;
    public setAttribute<
        K extends AttributeKeys<this> | string,
        T extends K extends AttributeKeys<this> ? this[K] : unknown = K extends AttributeKeys<this> ? this[K] : unknown
    >(key: K, value: T): this;
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
                value as Collection<Attributes> | MaybeArray<Attributes> | MaybeArray<Model> | ModelCollection<Model>
            );

            return this;
        }

        this.attributes[key] = cloneDeep(value);
        this.createDescriptor(key);

        return this;
    }

    /**
     * Create simple access for the getters and setters that have no underlying attribute set.
     *
     * Should only be called after the attributes have already been set.
     */
    protected setupMagicAccess(this: this): void {
        const getters: string[] = [];
        const setters: string[] = [];

        this.constructor
            .toString()
            .match(/(?<!\$)(?:get|set)[a-zA-Z0-9_]*Attribute(?=\s*\()/g)
            ?.forEach(name => {
                const type = name.startsWith('get') ? 'get' : 'set';
                const attribute = this.setStringCase(name.slice(3, name.length - 'Attribute'.length));

                // if the attribute is already defined, the getters and setters will get created already
                if (this.attributes.hasOwnProperty(attribute)) {
                    return;
                }

                if (type === 'get') {
                    getters.push(attribute);
                } else {
                    setters.push(attribute);
                }
            });

        getters.forEach(attribute => {
            const setter = setters.findIndex(name => name === attribute);

            const descriptor: PropertyDescriptor = {
                get: () => (this[`get${pascal(attribute)}Attribute`] as CallableFunction)(),
                enumerable: true,
                configurable: true
            };

            if (setter !== -1) {
                descriptor.set = newValue => (this[`set${pascal(attribute)}Attribute`] as CallableFunction)(newValue);

                // remove so it's not set up as a setter again later
                setters.splice(setter, 1);
            }

            Object.defineProperty(this, attribute, descriptor);
        });

        setters.forEach(attribute => {
            Object.defineProperty(this, attribute, {
                set: newValue => (this[`set${pascal(attribute)}Attribute`] as CallableFunction)(newValue),
                enumerable: true,
                configurable: true
            });
        });
    }

    /**
     * Create descriptors for the given key(s) therefore allowing magic access.
     *
     * @param {string|string[]} keys
     *
     * @return {this}
     */
    protected createDescriptor(keys: MaybeArray<AttributeKeys<this> | string>): this;
    protected createDescriptor(keys: MaybeArray<string>): this {
        keys = Array.isArray(keys) ? keys : [keys];

        // set up getters and setters
        keys.forEach(key => {
            Object.defineProperty(this, key, {
                get: () => this.getAttribute(key),
                set: newValue => this.setAttribute(key, newValue),
                enumerable: true,
                configurable: true
            });
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
    public deleteAttribute(key: AttributeKeys<this> | string): this;
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
    protected hasSetMutator(key: AttributeKeys<this> | string): boolean;
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
    protected hasGetAccessor(key: AttributeKeys<this> | string): boolean;
    protected hasGetAccessor(key: string): boolean {
        return `get${pascal(key)}Attribute` in this && this[`get${pascal(key)}Attribute`] instanceof Function;
    }

    /**
     * Fill the model with the given attributes while respecting the guarding settings.
     *
     * @param {object} attributes
     *
     * @return {this}
     */
    public fill(attributes: Attributes | Attributes<this>): this;
    public fill(attributes: Attributes): this {
        this.forceFill(this.getFillableFromObject(attributes));

        return this;
    }

    /**
     * Fill the model with the given attributes without respecting the guarding settings.
     *
     * @param {object} attributes
     *
     * @return {this}
     */
    public forceFill(attributes: Attributes | Attributes<this>): this;
    public forceFill(attributes: Attributes): this {
        attributes = transformKeys(attributes, this.attributeCasing);

        Object.keys(attributes).forEach(name => {
            this.setAttribute(name, attributes[name]);
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
    public syncOriginal(keys?: MaybeArray<SimpleAttributeKeys<this> | string>): this;
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
    public getOriginal<K extends SimpleAttributeKeys<this> | string, T extends this[K]>(key: K, defaultValue?: T): T;
    public getOriginal(): SimpleAttributes<this>;
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
    public getRawOriginal<K extends SimpleAttributeKeys<this> | string, T extends this[K]>(key: K, defaultValue?: T): T;
    public getRawOriginal(): SimpleAttributes<this>;
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
    public getChanges<K extends SimpleAttributeKeys<this>>(key: K): Record<K, this[K] | undefined>;
    public getChanges(key?: string): Partial<SimpleAttributes<this>>;
    public getChanges(key?: string): SimpleAttributes {
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
    public getDeletedAttributes<K extends SimpleAttributeKeys<this>>(key: K): Record<K, this[K] | undefined>;
    public getDeletedAttributes(key?: string): Partial<SimpleAttributes<this>>;
    public getDeletedAttributes(key?: string): SimpleAttributes {
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
    public getNewAttributes<K extends SimpleAttributeKeys<this>>(key: K): Record<K, this[K] | undefined>;
    public getNewAttributes(key?: string): Partial<SimpleAttributes<this>>;
    public getNewAttributes(key?: string): SimpleAttributes {
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

        const rawOriginalAttributes = this.getRawOriginal();
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
    public hasChanges(key?: SimpleAttributeKeys<this> | string): boolean;
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
    public isDirty(key?: SimpleAttributeKeys<this> | string): boolean;
    public isDirty(key?: string): boolean {
        return this.hasChanges(key);
    }

    /**
     * Determine whether given or any attributes was changed.
     *
     * @param {string|undefined} key
     */
    public isClean(key?: SimpleAttributeKeys<this> | string): boolean;
    public isClean(key?: string): boolean {
        return !this.hasChanges(key);
    }

    /**
     * Get a subset of the model's attributes.
     *
     * @param {string|string[]} attributes
     *
     * @return {object}
     */
    public only<
        K extends SimpleAttributeKeys<this>[],
        R = { [P in K[number]]?: SimpleAttributes<this>[P] }
    >(attributes: K): R;
    public only<K extends SimpleAttributeKeys<this>, R = Record<K, this[K]>>(attributes: K): R;
    public only(attributes: MaybeArray<string>): SimpleAttributes {
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
    public except<K extends SimpleAttributeKeys<this>[], R = Omit<SimpleAttributes<this>, K[number]>>(attributes: K): R;
    public except<K extends SimpleAttributeKeys<this> | string, R = Omit<SimpleAttributes<this>, K>>(attributes: K): R;
    public except(attributes: MaybeArray<string>): SimpleAttributes {
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
    public toJSON<T extends ReturnType<typeof JSON.parse> = RawAttributes<this>>(): T {
        const json = this.getRawAttributes() as SimpleAttributes;

        const relations = (this as unknown as HasRelations).getRelations();

        Object.keys(relations).forEach(relation => {
            if (relations[relation] instanceof HasAttributes) {
                json[relation] = relations[relation]!.toJSON();
                return;
            }

            json[relation] = (relations[relation] as ModelCollection<Model>).map(model => model.toJSON()).toArray();
        });

        return json as unknown as T;
    }

    /**
     * Show the model in a human-readable string representation.
     *
     * @return {string}
     */
    public override toString(): string {
        return JSON.stringify(this.toJSON(), null, 4);
    }
}
